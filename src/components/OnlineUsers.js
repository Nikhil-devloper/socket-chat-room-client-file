import React,{useState} from "react";

const OnlineUsers = (props) => {

  const { onUserSelect, users, username, checkUnseenMessages, rooms,onRoomSelect,createGroupRoom } = props;

  const [groupName,setGroupName] = useState('');


  return (
    <div className='room-container'>
      <div className="online-users-header">
        <div style={{ margin: "0 10px" }}>Online Users (You: {username})</div>
      </div>
      <ul className="users-list">
        {users &&
          Object.keys(users).map((user, index) => (
            <>
              {user !== username ? (
                <li key={user} onClick={() => onUserSelect(user)}>
                  <span style={{ textTransform: "capitalize" }}>{user}</span>

                  {checkUnseenMessages(user) !== 0 ? (
                    <span className="new-message-count">
                      {checkUnseenMessages(user)}
                    </span>
                  ) : null}

                </li>
              ) : null}
            </>
          ))}
      </ul>

      <div className='room-creation-and-room-list'>
          <input className='input' onChange={(e) => { setGroupName(e.target.value); }} value={groupName} />
          <button className='button' onClick={() => { createGroupRoom(groupName); setGroupName(''); } }> Create Room </button>
      </div>
      
      <div className='all-rooms'>
        All Rooms:
           
      </div>

      <ul className="users-list">
        {rooms &&
          rooms.map((room, index) => (
            <>
              <li key={room}
                  onClick={() => onRoomSelect(room)}
              >
                <span style={{ textTransform: "capitalize" }}>{room}</span>

                {/* {checkUnseenMessages(room) !== 0 ? (
                    <span className="new-message-count">
                      {checkUnseenMessages(room)}
                    </span>
                  ) : null} */}

              </li>

            </>
          ))}
      </ul>


    </div>
  );
};

export default OnlineUsers;
