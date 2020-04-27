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
          this.setState(prevState => ({
            connectionState: `Error: ${error}`
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
