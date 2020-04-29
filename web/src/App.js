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

import React from 'react';
import Amplify, { PubSub } from 'aws-amplify';
import { MqttOverWSProvider } from "@aws-amplify/pubsub/lib/Providers";

//TODO - add your ATS-specific custom domain here
const mqtt_host = 'xxxxxxxxxxxxxxxxxxxxx-ats.iot.us-east-1.amazonaws.com'
const mqtt_topic = '#'

Amplify.addPluggable(new MqttOverWSProvider({
     aws_pubsub_endpoint: `wss://${mqtt_host}/mqtt?token=allow`,
}));

function MessageList(props){
  const messages = props.messages
  const listItems = messages.map((data, i) =>
    <li key={i}>{JSON.stringify(data)}</li>
  )

  return(
    <ul>{listItems}</ul>
  )
}

export default class App extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      messages:[],
      connectionState: 'Initializing Connection...',
    }
  }

  componentDidMount(){
    PubSub.subscribe(mqtt_topic).subscribe({
        next: data => {
          data.value.client_received_at = new Date()
          console.log(`Message received: ${JSON.stringify(data.value)} \nRaw data: ${JSON.stringify(data)}`)

          this.setState(prevState => ({
            connectionState: `Connected and Subscribed to topic '${mqtt_topic}'; Messages Received`,
            messages: [...prevState.messages, data.value]
          }))
        },
        error: error => {
          console.log(JSON.stringify(error, null, 2))
          this.setState(prevState => ({
            connectionState: `Failed to subscribe to topic '${mqtt_topic}' on endpoint ${mqtt_host}: ${error.error.errorMessage}`
          }))
        },
        close: () => {
          this.setState({ connectionState: `Connection Closed` })
        },
    })


    this.setState({ connectionState: `Connected and Subscribed to topic '${mqtt_topic}'; Awaiting Messages...` })
  }

  render(){
    const messages = this.state.messages
    const connectionState = this.state.connectionState

    return (
      <div className="App">
        <h2>{connectionState}</h2>
        <MessageList messages={messages} />
      </div>
    )
  }
}
