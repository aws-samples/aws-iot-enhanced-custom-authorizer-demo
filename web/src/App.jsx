/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useState, useEffect } from 'react';
import { PubSub } from '@aws-amplify/pubsub/mqtt';
import './App.css';

//TODO - add your ATS-specific custom domain here
const mqtt_host = 'xxxxxxxxxxxxxxxxxxxxx-ats.iot.us-east-1.amazonaws.com'
const mqtt_topic = '#'

const pubsub = new PubSub({
  endpoint: `wss://${mqtt_host}/mqtt?token=allow`,
});

function MessageList({ messages }) {
  return (
    <ul>
      {messages.map((data, i) => (
        <li key={i}>{JSON.stringify(data)}</li>
      ))}
    </ul>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [connectionState, setConnectionState] = useState('Initializing Connection...');

  useEffect(() => {
    const sub = pubsub.subscribe({ topics: [mqtt_topic] }).subscribe({
      next: (data) => {
        const value = { ...data, client_received_at: new Date() };
        console.log(`Message received: ${JSON.stringify(value)}`);
        setConnectionState(`Connected and Subscribed to topic '${mqtt_topic}'; Messages Received`);
        setMessages((prev) => [...prev, value]);
      },
      error: (error) => {
        console.log(JSON.stringify(error, null, 2));
        setConnectionState(
          `Failed to subscribe to topic '${mqtt_topic}' on endpoint ${mqtt_host}: ${error.message || error}`
        );
      },
      complete: () => {
        setConnectionState('Connection Closed');
      },
    });

    setConnectionState(`Connected and Subscribed to topic '${mqtt_topic}'; Awaiting Messages...`);

    return () => sub.unsubscribe();
  }, []);

  return (
    <div className="App">
      <h2>{connectionState}</h2>
      <MessageList messages={messages} />
    </div>
  );
}
