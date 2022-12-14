type UserStateType = {
  userName: string;
  setUserName: (userName: string) => void;
};

const UserNameInput = ({ userName, setUserName }: UserStateType) => {
  // 十文字制限
  const changeUserName = (changeValue: string) => {
    if (changeValue.length <= 10) setUserName(changeValue);
  };

  return (
    <div className="pt-6">
      <h1 className="text-3xl sm:text-4xl tracking-widest lg:text-4xl">
        user name
      </h1>

      <div className="mt-3">
        <input
          data-testid="username"
          name="username"
          type="text"
          value={userName}
          onChange={(e) => changeUserName(e.target.value)}
          className="block w-full px-4 py-2 mt-2 bg-poker-color rounded-md border-gold focus:outline-none"
          autoComplete="off"
        />
      </div>
    </div>
  );
};

export default UserNameInput;
