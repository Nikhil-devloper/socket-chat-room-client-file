import "./App.css";
import { io } from "socket.io-client";
import logo from "./assets/chat.png";
import { useEffect, useRef, useState } from "react";

import CreateUser from "./components/CreateUser";
import OnlineUsers from "./components/OnlineUsers";
import MessagesControl from "./components/MessagesControl";
import GroupControl from './components/GroupControl';


const socket = io(`http://localhost:7000`);

function App() {
  const [step, setStep] = useState(0);

  const [username, setUsername] = useState("");
  const [receiver, setReceiver] = useState("");

  const [avatar, setAvatar] = useState("");
  const [media, setMedia] = useState(null);

  const [users, setUsers] = useState({});

  const [message, setMessage] = useState("");
  const [groupMessage, setGroupMessage] = useState({});

  const [rooms,setRooms] = useState([]);

  const [roomMessages,setRoomMessage] = useState('');

  const [myRoom,setMyRoom] = useState('');

  const receiverRef = useRef(null);

  const sortNames = (username1, username2) => {
    return [username1, username2].sort().join("-");
  };

  const gotoBottom = () => {

    const el = document.querySelector(".message-area ul");
    if (el) {
      el.scrollTop = el.scrollHeight;
    }

  };

  const onCreateUser = () => {

    console.log(username);

    socket.emit("new_user", username);
    const a = parseInt(Math.floor(Math.random() * 8) + 1) + ".png";
    setAvatar(a);

    setStep((prevStep) => prevStep + 1);

  };

  const onUserSelect = (username) => {

    setReceiver(username);
    receiverRef.current = username;
    setStep((prevStep) => prevStep + 1);

  };

  const onRoomSelect = (roomName) => {
    setStep(3);
    setMyRoom(roomName);
    socket.emit("join_room", roomName);
    //receiverRef.current = username;    

  }

  const onChatClose = () => {

    setStep(1);
    receiverRef.current = null;

  };

  const sendMessage = (e) => {
    e.preventDefault();

    const data = {
      sender: username,
      receiver,
      message,
      media,
      avatar,
      view: false,
    };

    //here we are sending
    socket.emit("send_message", data);

    const key = sortNames(username, receiver);

    const tempGroupMessage = { ...groupMessage };
    if (key in tempGroupMessage) {
      tempGroupMessage[key] = [
        ...tempGroupMessage[key],
        { ...data, view: true },
      ];
    } else {
      tempGroupMessage[key] = [{ ...data, view: true }];
    }

    setGroupMessage({ ...tempGroupMessage });

    if (media !== null) {
      setMedia(null);
    }

    setMessage("");

    // rizwan, ana [rizwan-ana] => [m1, m2, m3], ana-rizwan
    // rizwan, sachin [rizwan-sachin] => [m1, m2, m3]
    //ana, sachin [ana-sachin] => [m1, m2, m3]
  };

  const checkUnseenMessages = (receiver) => {
    const key = sortNames(username, receiver);
    let unseenMessages = [];
    if (key in groupMessage) {
      unseenMessages = groupMessage[key].filter((msg) => !msg.view);
    }

    return unseenMessages.length;
  };

  useEffect(() => {

    socket.on('all_room',(data) => {
      console.log('data 1234',data)
      setRooms(data);
    });

    socket.on('connectToRoom',(data) => {
      console.log('####1234',data);
      setRoomMessage(data);
    });



    socket.on("all_users", (users) => {
      console.log({ users });
      setUsers(users);
    });

    socket.on("new_message", (data) => {
      console.log(data);

      console.log({ rec: receiverRef.current, data }, "asfedfee");

      setGroupMessage((prevGroupMessage) => {
        const messages = { ...prevGroupMessage };
        const key = sortNames(data.sender, data.receiver);

        if (receiverRef.current === data.sender) {
          data.view = true;
        }

        if (key in messages) {
          messages[key] = [...messages[key], data];
        } else {
          messages[key] = [data];
        }

        return { ...messages };
      });
    });

  }, []);

  useEffect(() => {
    //here we are going to update view count of selected user = receiver
    updateMessageView();
  }, [receiver]);

  const updateMessageView = () => {

    const key = sortNames(username, receiver);
    if (key in groupMessage) {

      const messages = groupMessage[key].map((msg) =>
        !msg.view ? { ...msg, view: true } : msg
      );

      groupMessage[key] = [...messages];

      setGroupMessage({ ...groupMessage });
    }
  };

  useEffect(() => {
    const key = sortNames(username, receiver);
    if (key in groupMessage) {
      if (groupMessage[key].length > 0) {
        gotoBottom();
      }
    }
  }, [groupMessage]);


  createGroupRoom = (groupName) => {
    socket.on('createGroup',groupName)
  }

  return (
    <div className="App">
      <header className="app-header">
        <img src={logo} alt="" />
        <div className="app-name b-500 primaryColor">My Chat</div>
      </header>

      <div className="chat-system">
        <div className="chat-box">
          {/* step0:  ask username ro email */}
          {step === 0 ? (
            <CreateUser
              onCreateUser={onCreateUser}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          ) : null}
          {/* Step1: show all available users */}
          {step === 1 ? (
            <OnlineUsers
              onUserSelect={onUserSelect}
              users={users}
              username={username}
              checkUnseenMessages={checkUnseenMessages}
              rooms={rooms}
              onRoomSelect={onRoomSelect}
              createGroupRoom={createGroupRoom}
            />
          ) : null}
          {/* Step2: select user and switch to chat window */}
          {step === 2 ? (
            <MessagesControl
              value={message}  //clear
              onChange={(e) => setMessage(e.target.value)}  //clear


              sendMessage={sendMessage}
              groupMessage={groupMessage}

              sortNames={sortNames}
              username={username}

              receiver={receiver}
              setMedia={setMedia}

              onChatClose={onChatClose}
              media={media}              

            />
          ) : null}

          {console.log('step',step)}

          {step === 3 ?
            <GroupControl 
            roomMessages={roomMessages}
            
            />
          : null}
        </div>
      </div>
    </div>
  );
}

export default App;


//https://medium.com/@emccul13/socket-io-9bceb00dbf46