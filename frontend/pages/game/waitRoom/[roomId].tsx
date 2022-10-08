import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ShowRoomId from "../../../src/components/atoms/show/ShowRoomId";
import { useUserInfo } from "../../../src/components/hooks/user/useUserInfo";
import Loading from "../../../src/components/templates/Loading";
import styles from "../../../styles/Home.module.css";

type ReadyType = {
  userInfoReady: boolean;
  memberInfoReady: boolean;
};

const WaitRoom: NextPage = () => {
  const [isReady, setIsReady] = useState<ReadyType>({
    userInfoReady: false, // userInfoが取得できているか
    memberInfoReady: false, // wsによって一回でもroomのmember情報を取得できているかどうか
  });
  const { userInfo, confirmUserInfo_context_cookie } = useUserInfo();
  const router = useRouter();

  useEffect(() => {
    if (!confirmUserInfo_context_cookie()) {
      router.push("/start");
    }
    setIsReady((isReady) => ({ ...isReady, userInfoReady: true }));
  }, []);

  if (!(isReady.userInfoReady && isReady.memberInfoReady)) {
    return <Loading />;
  }

  return (
    <div className="bg-poker-color font-poker-color font-poker-family">
      <section className="h-screen bg-cover">
        <div className="flex w-full items-center justify-center container mx-auto px-8">
          <div className="max-w-2xl text-center">
            <div className="pt-10 pb-6 text-2xl sm:text-3xl capitalize tracking-widest">
              <h1 className={styles.updown}>
                <span>W</span>
                <span>a</span>
                <span>i</span>
                <span>t</span>
                <span>i</span>
                <span>n</span>
                <span>g</span>
                <span>&nbsp;</span>
                <span>M</span>
                <span>e</span>
                <span>m</span>
                <span>b</span>
                <span>e</span>
                <span>r</span>
                <span>s</span>
                <span>...</span>
              </h1>
            </div>
            <ShowRoomId roomID={userInfo.roomID as string} />

            <ul className="pt-8 text-2xl capitalize tracking-widest border-t-2 border-[#95913f]">
              <li className="pb-3">Hasegawa Akito</li>
              <li className="pb-3">Tano</li>
              <li className="pb-3">Hujithiy</li>
            </ul>
            <div className="pt-3 pb-20 w-full z-10 absolute bottom-0 left-0 lg:pb-10 bg-poker-color">
              <button className="px-6 py-2 mr-1 border-gold-button transition-colors duration-300 transform rounded-md">
                Quit Room
              </button>
              <button className="px-6 py-2 ml-1 bg-gold-button transition-colors duration-300 transform rounded-md">
                Start Room
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WaitRoom;
