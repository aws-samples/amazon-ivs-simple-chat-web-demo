// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState, createRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const SignIn = ({ updateUsername }) => {
  const [username, setUsername] = useState('');
  const inputRef = createRef();

  useEffect(() => {
    inputRef.current.focus();
  }, [inputRef]);

  return (
    <div className="modal pos-absolute top-0 bottom-0">
      <div className="modal__el">
        <h1 className="mg-b-2">Enter your name</h1>
        <form>
          <fieldset>
            <input 
              name="name" 
              id="name" 
              ref={inputRef}
              type="text" 
              className="rounded" 
              placeholder="Type here..." 
              autoComplete="off" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
            />
            <button 
              onClick={() => updateUsername(username)} 
              className="btn btn--primary rounded mg-t-1"
              disabled={!username}
            >Start chatting</button>
          </fieldset>
        </form>
      </div>
      <div className="modal__overlay"></div>
    </div>
  );
}

SignIn.propTypes = {
  updateUsername: PropTypes.func,
};

export default SignIn;