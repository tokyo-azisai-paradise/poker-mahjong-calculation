import axios from "axios";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useUserInfo } from "../../../src/components/hooks/user/useUserInfo";
import Connecting from "../../../src/components/templates/game/Connecting";
import GameController from "../../../src/components/templates/game/GameController";
import {
  GameContextType,
  GameInfoType,
  RoomStatusType,
} from "../../../src/types/game/type";

export const GameContext = createContext<GameContextType | undefined>(
  undefined
);

const PlayRoom: NextPage = () => {
  const { userInfo, confirmUserInfo_context_cookie } = useUserInfo();
  const router = useRouter();
  const socketRef = useRef<WebSocket>();
  const [isReady, setIsReady] = useState({
    isRoomReady: false,
    message_WS_Ready: false, //WSでbackendからmember情報を受け取っているか
  });

  const [gameInfo, setGameInfo] = useState<GameInfoType>();
  // ^^^ contet ProviderのvalueがundefinedとなってしまうためカスタムフックのuseGameInfoでエラー処理済み
  // ^^^ 初期値を設定しないのは初期値が大量であり、context部分がレンダーされる時はstateがsetされることが確定のため

  const confirmRoomStatus = useCallback(async () => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL +
        "/api/status/" +
        userInfo.gameType +
        "/" +
        userInfo.roomID;
      const res = await axios.get(apiUrl);
      const roomStatus: RoomStatusType = res.data.status;

      if (!(roomStatus === "on game")) {
        // on gameの状態でなければgameできない
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }, [userInfo.gameType, userInfo.roomID]);

  useEffect(() => {
    (async () => {
      if (!(await confirmUserInfo_context_cookie())) {
        router.push("/start");
        return;
      }

      const { roomId } = router.query;
      if (roomId !== userInfo.roomID) {
        router.push("/start");
        return;
      }

      if (!(await confirmRoomStatus())) {
        router.push("/start");
        return;
      }
      setIsReady((isReady) => ({ ...isReady, isRoomReady: true }));
    })();
  }, []);

  // WS接続用。closeしてもconnectiongページでこの関数を実行し再接続可能
  const connectWS = useCallback(() => {
    socketRef.current = new WebSocket(
      process.env.NEXT_PUBLIC_WS_URL +
        "/ws/" +
        userInfo.roomID +
        "?userID=" +
        userInfo.userID
    );

    socketRef.current.onopen = function () {
      console.log("Connected");
    };

    socketRef.current.onclose = function () {
      setIsReady((isReady) => ({ ...isReady, message_WS_Ready: false }));
      console.log("closed");
    };

    // server 側から送られてきたデータを受け取る
    socketRef.current.onmessage = function (event) {
      const gameInfo_JSON = event.data;
      const gameInfo_obj: GameInfoType = JSON.parse(gameInfo_JSON);
      setGameInfo(gameInfo_obj);
      setIsReady((isReady) => ({ ...isReady, message_WS_Ready: true }));
    };
  }, []);

  // WSによるリアルタイム通信
  useEffect(() => {
    if (!isReady.isRoomReady) {
      // roomの状態やuser情報が確認でき次第WS通信を行う。
      return;
    }

    connectWS(); // WSを設定

    return () => {
      if (socketRef.current == null) {
        return;
      }
      socketRef.current.close();
    };
  }, [isReady.isRoomReady, userInfo.roomID, userInfo.userID]);

  if (!(isReady.isRoomReady && isReady.message_WS_Ready)) {
    return <Connecting connectWS={() => connectWS()} />;
  }
  return (
    <GameContext.Provider value={{ gameInfo, setGameInfo }}>
      <GameController />
    </GameContext.Provider>
  );
};

export default PlayRoom;
