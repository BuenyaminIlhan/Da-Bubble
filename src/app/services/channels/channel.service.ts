import { Injectable, ElementRef, ViewChild } from '@angular/core';
import { Firestore, Timestamp, collectionData } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { addDoc, collection } from '@firebase/firestore';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  constructor(private channelChat: Firestore) {
  };

  chatCollection: any = collection(this.channelChat, 'channelChats');
  chats$: Observable<any>
  private chatData$: Observable<any>;
  relevantChats: any[];
  channels: any = {
    name: 'Entwicklerteam',
    admin: 'Sufyan',
    members: [
      'Bünyamin Ilhan',
      'Steffen Schanze'
    ]
  }


  channelMessage: any = {
    message: '',
    timeStamp: 0,
    channel: '',
    sender: '',
    avatar: ''
  }

  getChatData(): Observable<any> {
    return this.chatData$;
  }

  postChat(message: any, selectedChannel: string) {
    const chatDate = new Date();
    console.log(chatDate)
    const timeStamp = Timestamp.fromDate(chatDate)
    this.channelMessage.timeStamp = timeStamp.seconds;
    let loggedUser = JSON.parse(localStorage.getItem('userData'));
    this.channelMessage.avatar = loggedUser.avatar
    this.channelMessage.sender = loggedUser.name;
    this.channelMessage.message = message;
    this.channelMessage.channel = selectedChannel;
    addDoc(this.chatCollection, this.channelMessage);
  }

  showChannelChat(channel) {
    this.showNameInBoardHead(channel);
    this.showNameAsPlaceholderOfTextarea(channel);
  }

  showNameInBoardHead(channel) {
    document.getElementById('selected-recipient').innerHTML = `# ` + channel.name
  }

  showNameAsPlaceholderOfTextarea(channel) {
    const chatField = document.getElementById('textarea') as HTMLTextAreaElement;
    chatField.placeholder = `Nachricht an @ ` + channel.name;
  }

  // getChats(selectedChannel) {
  //   const channel = localStorage.getItem('channel')
  //   console.log(channel)
  //   this.chats$ = collectionData(this.chatCollection, { idField: 'id' });
  //   this.chats$ = this.chats$.pipe(
  //     map(chats => chats.filter(chat => chat.channel == selectedChannel.name)),
  //     map(chats => chats.sort((a, b) => a.timeStamp - b.timeStamp))
  //   );
  //   this.chats$.subscribe((chats) => {
  //     this.scrollToBottom()
  //   });
  // }

  // renderChats() {
  //   let loggedUser = JSON.parse(localStorage.getItem('userData'));
  //   let content = document.getElementById('message-content');
  //   content.innerHTML = "";

  //   for (let i = 0; i < this.relevantChats.length; i++) {
  //     let element = this.relevantChats[i];
  //     if (loggedUser.name == element.sender) {
  //       content.innerHTML += this.returnStentMessageChat(element, loggedUser,);

  //     } else {
  //       content.innerHTML += this.returnRecievedMessageChat(element, i);
  //     }
  //     document.getElementById(`recieved`).addEventListener("click", this.openDialogChannelAnswer);
  //   }
  //   this.scrollToBottom();
  //   document.getElementById(`recieved`).addEventListener("click", this.openDialogChannelAnswer);
  // }

  // scrollToBottom() {
  //   document.getElementById('content-frame').scrollTop = document.getElementById('content-frame').scrollHeight;
  // }


  // returnStentMessageChat(element, loggedUser) {
  //   const unixTimestamp = element.timeStamp;
  //   const jsDate = new Date(unixTimestamp * 1000);
  //   const day = jsDate.getDate().toString().padStart(2, '0');
  //   const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
  //   const year = jsDate.getFullYear();
  //   const hour = jsDate.getHours();
  //   const minute = jsDate.getMinutes().toString().padStart(2, '0');
  //   return `
  //   <div class="sent-container">
  //   <div class="sent-name-avatar">
  //   <div><span>${element.sender}</span>
  //     <div class="sent-message">
  //       <span class="date">${day}.${month}.${year}  ${hour}:${minute}</span>
  //       <span>${element.message}</span>
  //       <span class="answer" onclick="openDialogChannelAnswer()">Gib <span class="element-sender">${element.sender} </span> eine Antwort</span>
  //     </div>
  //     </div>
  //     <img class="avatar" src="${loggedUser.avatar}">
  //     </div>
  //     </div>
  //     </div>
  //   `;
  // }

  // returnRecievedMessageChat(element, i) {
  //   const unixTimestamp = element.timeStamp;
  //   const jsDate = new Date(unixTimestamp * 1000);
  //   const day = jsDate.getDate().toString().padStart(2, '0');
  //   const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
  //   const year = jsDate.getFullYear();
  //   const hour = jsDate.getHours().toString().padStart(2, '0');
  //   const minute = jsDate.getMinutes().toString().padStart(2, '0');
  //   return `<div class="recieved-container">
  //   <div class="recieved-name-avatar">
  //   <div><span>${element.sender}</span>
  //   <div class="recieved-message">
  //   <span class="date">${day}.${month}.${year}  ${hour}:${minute}</span>
  //   <span>${element.message}</span>
  //   <span id="recieved" class="answer">Gib <span class="element-sender">${element.sender} </span> eine Antwort</span>
  //       </div>
  //       </div>
  //       <img class="avatar" src="${element.avatar}">
  //       </div>
  //       </div>
  //   `
  // }

  openDialogChannelAnswer(){
    console.log('answered');
  }
}
