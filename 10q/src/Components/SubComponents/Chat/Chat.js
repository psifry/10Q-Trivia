import React, { Component } from "react";
//Material-ui
import ContentSend from "material-ui/svg-icons/content/send";
import TextField from "material-ui/TextField";
//React-redux
import { connect } from "react-redux";
//Local
import MessageList from "./MessageList/MessageList";
import "./Chat.css";

class Chat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      messageList: []
    };

    this.userTyping = this.userTyping.bind(this);
    this.handleChat = this.handleChat.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.confirmTyping = this.confirmTyping.bind(this);
    this.handleEmoji = this.handleEmoji.bind(this);
  }

  componentDidMount() {
    this.props.socket.on("receive message", messages => {
      this.addMessage(messages);
    });
  }

  componentDidUpdate() {
    const height = this.divElement.scrollHeight;
    this.divElement.scrollTop = height;
  }

  addMessage(message) {
    this.setState({
      messageList: [...this.state.messageList, message]
    });
  }

  userTyping(message) {
    this.setState({
      message
    });
  }

  handleEmoji(emojiName, emojiData) {
    if (emojiData.name.includes(":")) {
      let emojiWord = emojiData.name.substring(0, emojiData.name.indexOf(":"));
      this.setState({
        message: `${this.state.message} :${emojiWord}: `
      });
    } else {
      let emojiWord = emojiData.name;
      this.setState({
        message: `${this.state.message} :${emojiWord}: `
      });
    }
  }

  handleChat(val) {
    if (this.state.message) {
      val.preventDefault();
      this.props.socket.emit("send message", {
        img: this.props.user.img,
        user: this.props.user.first_name,
        message: this.state.message
      });
      this.setState({
        message: ""
      });
    }
  }

  confirmTyping(event) {
    if (event.keyCode === 13 && this.state.message) {
      this.props.socket.emit("send message", {
        img: this.props.user.img,
        user: this.props.user.first_name,
        message: this.state.message
      });
      this.setState({
        message: ""
      });
    }
  }

  render() {
    const { message } = this.state;
    let chatBox = this.state.messageList.map((message, index) => {
      return (
        <MessageList
          key={index}
          user={message.user}
          message={message.message}
          img={message.img}
          index={index}
        />
      );
    });

    return (
      <div className="chat-main">
        <div className="chat-box-container">
          <div
            className="chat-box"
            ref={divElement => (this.divElement = divElement)}
          >
            {chatBox}
          </div>
        </div>
        <div className="chat-input-container">
          <TextField
            onChange={e => this.userTyping(e.target.value)}
            onKeyDown={this.confirmTyping}
            type="text"
            underlineStyle={{ borderColor: "#ffffff" }}
            underlineFocusStyle={{ borderColor: "#f85f6b" }}
            inputStyle={{ color: "#ffffff", background: "transparent" }}
            value={message}
            id="text-field"
          />
          <ContentSend onClick={this.handleChat} className="chat-send" />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.loginReducer.user
  };
};

export default connect(mapStateToProps)(Chat);
