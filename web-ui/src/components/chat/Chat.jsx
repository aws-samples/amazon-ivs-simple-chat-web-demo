// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState, createRef } from 'react';
import * as config from '../../config';

// Components
import VideoPlayer from '../videoPlayer/VideoPlayer';
import SignIn from './SignIn';

// Styles
import './Chat.css';

const Chat = () => {
  const [metadataId, setMetadataId] = useState(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  
  const chatRef = createRef();
  const messagesEndRef = createRef();
  
  useEffect(() => {

    const initConnection = async () => {
      const connectionInit = new WebSocket(config.CHAT_WEBSOCKET);
      connectionInit.onopen = (event) => {
        console.log("WebSocket is now open.");
      };
    
      connectionInit.onclose = (event) => {
        console.log("WebSocket is now closed.");
      };
    
      connectionInit.onerror = (event) => {
        console.error("WebSocket error observed:", event);
      };
    
      connectionInit.onmessage = (event) => {
        // append received message from the server to the DOM element 
        const data = event.data.split('::');
        const username = data[0];
        const message = data.slice(1).join('::'); // in case the message contains the separator '::'
    
        const newMessage = {
          timestamp: Date.now(),
          username,
          message
        }
  
        setMessages((prevState) => {
          return [
            ...prevState,
            newMessage
          ];
        });
      };
      setConnection(connectionInit);
    }
    initConnection();
  }, [])

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    scrollToBottom();
  });


  const updateUsername = username => {
    console.log('username!', username);
    setUsername(username);
    setShowSignIn(false);
    chatRef.current.focus()
  }

  const handleOnClick = () => {
    if (!username) {
      setShowSignIn(true);
    }
  }

  const handleChange = e => {
    setMessage(e.target.value);
  }

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) { // keyCode 13 is carriage return
      if (message) {
        const data = `{
          "action": "sendmessage",
          "data": "${username}::${message.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"
        }`;
        connection.send(data);
        setMessage('');
      }
    }
  }

  const parseUrls = (userInput) => {
    var urlRegExp = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_.~#?&//=]*)/g;
    let formattedMessage = userInput.replace(urlRegExp, (match) => {
      let formattedMatch = match;
      if (!match.startsWith('http')) {
        formattedMatch = `http://${match}`;
      }
      return `<a href=${formattedMatch} class="chat-line__link" target="_blank" rel="noopener noreferrer">${match}</a>`;
    });
    return formattedMessage;
  }
  
  const renderMessages = () => {
    return (
      messages.map(msg => {
        let formattedMessage = parseUrls(msg.message);
        return (
          <div className="chat-line" key={msg.timestamp}>
            <p><span className="username">{msg.username}</span><span dangerouslySetInnerHTML={{__html: formattedMessage}} /></p>
          </div>
        )
      })
    )
  }

  return (
    <>
      <header>
        <h1>Simple Live Chat demo</h1>
      </header>
      <div className="main full-width full-height chat-container">
        <div className="content-wrapper mg-2">
        <VideoPlayer setMetadataId={setMetadataId} videoStream={config.PLAYBACK_URL} />
          <div className="col-wrapper">
            <div className="chat-wrapper pos-absolute pd-t-1 top-0 bottom-0">
              <div className="messages">
                {renderMessages()}
                <div ref={messagesEndRef} />
              </div>
              <div className="composer">
                <input 
                  ref={chatRef}
                  className={`rounded ${!username ? 'hidden' : ''}`} 
                  type="text" 
                  placeholder="Say something"
                  value={message}
                  maxLength={510}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                />
                {!username && (
                  <fieldset>
                    <button onClick={handleOnClick} className="btn btn--primary full-width rounded">Click to send messages</button>
                  </fieldset>
                )}
              </div>
            </div>
          </div>
        </div>
        {showSignIn && 
          <SignIn updateUsername={updateUsername} />
        }
      </div>
    </>
  )
  
}

export default Chat;