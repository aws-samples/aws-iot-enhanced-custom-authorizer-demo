import React from 'react';
import Amplify, { PubSub } from 'aws-amplify';
import { MqttOverWSProvider } from "@aws-amplify/pubsub/lib/Providers";

//TODO - add your ATS-specific custom domain here
const mqtt_host = 'xxxxxxxxxxxxxxxxxxxxx-ats.iot.us-east-1.amazonaws.com'

Amplify.addPluggable(new MqttOverWSProvider({
     aws_pubsub_endpoint: `wss://${mqtt_host}/mqtt?token=allow`,
}));

function MessageList(props){
  const messages = props.messages
  const listItems = messages.map((data, i) =>
    <li key={i}>{data.client_received_at.toString()} - {data.message}</li>
  )

  return(
    <ul>{listItems}</ul>
  )
}

export default class App extends React.Component {

  constructor(props){
    super(props)
    this.state = {messages:[]}
  }

  componentDidMount(){
    PubSub.subscribe('#').subscribe({
        next: data => {
          data.value.client_received_at = new Date()
          console.log(`Message received: ${JSON.stringify(data.value)}`)
          this.setState(prevState => ({
            messages: [...prevState.messages, data.value]
          }))
        },
        error: error => console.error(error),
        close: () => console.log('Done'),
    })
  }

  render(){
    const messages = this.state.messages

    return (
      <div className="App">
        <MessageList messages={messages} />
      </div>
    )
  }
}
