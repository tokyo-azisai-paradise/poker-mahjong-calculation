import { NextPage } from "next";
import { useRouter } from "next/router";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import AnimationStrWaiting from "../../../src/components/atoms/show/game/AnimationStrWaiting";
import ShowRoomId from "../../../src/components/atoms/show/game/ShowRoomId";
import WaitingMember from "../../../src/components/atoms/show/game/WaitingMember";
import { useUserInfo } from "../../../src/components/hooks/user/useUserInfo";
import axios from "axios";
import type {
  MemberContextType,
  RoomStatusType,
  MemberInfoType,
  GameInfoType,
} from "../../../src/types/game/type";
import StartQuitRoom from "../../../src/components/Organisms/game/StartQuitRoom";
import SetOption from "../../../src/components/Organisms/game/SetOption";
import Connecting from "../../../src/components/templates/game/Connecting";

// useContextでメンバー情報を子コンポーネントに共有
export const MemberContext = createContext<MemberContextType>({
  memberInfo: {},
  setMemberInfo: (memberInfo) => {},
});

const WaitRoom: NextPage = () => {
  const { userInfo, confirmUserInfo_context_cookie } = useUserInfo();
  const router = useRouter();
  const socketRef = useRef<WebSocket>();
  const [memberInfo, setMemberInfo] = useState<MemberInfoType>({});
  const [showOption, setShowOption] = useState(false);
  const [round, setRound] = useState(0);
  const [isReady, setIsReady] = useState({
    isRoomReady: false,
    message_WS_Ready: false, //WSでbackendからmember情報を受け取っているか
  });

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

      if (!(roomStatus === "waiting")) {
        // waitingの状態でなければwaitRoomにいる必要はない
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
      setMemberInfo(gameInfo_obj.users);
      setRound(gameInfo_obj.roomData.round);
      setIsReady((isReady) => ({ ...isReady, message_WS_Ready: true }));
    };
  }, []);

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
    <MemberContext.Provider value={{ memberInfo, setMemberInfo }}>
      <div className="bg-poker-color font-poker-color font-poker-family">
        {/* スタートボタンが押された時表示
            flex, hiddenによって表示制御することで際レンダリングによるoptionの値の初期化を防ぐ */}
        <div className={showOption ? "flex" : "hidden"}>
          <SetOption {...{ setShowOption }} />
        </div>
        <section className="h-screen bg-cover">
          <div className="flex w-full items-center justify-center container mx-auto px-8">
            <div className="max-w-2xl text-center">
              <AnimationStrWaiting />
              <ShowRoomId roomID={userInfo.roomID as string} />
              <WaitingMember />
              <StartQuitRoom
                {...{ round: round, setShowOption: setShowOption }}
              />
            </div>
          </div>
        </section>
      </div>
    </MemberContext.Provider>
  );
};

export default WaitRoom;
