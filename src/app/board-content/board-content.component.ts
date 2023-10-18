import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Firestore, collection, collectionData, Timestamp, deleteDoc, doc, getDoc, updateDoc, setDoc } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { Observable, map, BehaviorSubject, of } from 'rxjs';
import { ChannelService } from '../services/channels/channel.service';
import { DialogAddMembersComponent } from '../dialog-add-members/dialog-add-members.component';
import { ChannelChatComponent } from '../channel-chat/channel-chat.component';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { BoardThreadComponent } from '../board-thread/board-thread.component';
import { DialogChannelInfoComponent } from '../dialog-channel-info/dialog-channel-info.component';
import { DialogShowEmojisComponent } from '../dialog-show-emojis/dialog-show-emojis.component';
import { DialogChannelReactionsComponent } from '../dialog-channel-reactions/dialog-channel-reactions.component';


@Component({
  selector: 'app-board-content',
  templateUrl: './board-content.component.html',
  styleUrls: ['./board-content.component.scss']
})
export class BoardContentComponent implements OnInit {
  @Output() contentClicked = new EventEmitter<string>();
  @ViewChild('boardThread', { static: true }) boardThread: BoardThreadComponent;

  @Input() chat: any
  @ViewChild('recieved') recievedElement: ElementRef;

  open: boolean = true;
  loggedUser: any = {
    avatar: './assets/img/Profile.png',
    name: 'Gast'
  }

  reaction: any = {
    emoji: [],
    sender: '',
    timeStamp: 0
  }

  chatCollection: any = collection(this.firestore, 'chats');
  usersCollection: any = collection(this.firestore, 'users');
  channelCollection: any = collection(this.firestore, 'channels')
  users: any[] = [];
  chatsChannel$ !: Observable<any>;
  chats$ !: Observable<any>;
  channelMembers$: Observable<any>;
  filteredChannelMembers$: Observable<any[]>;
  membersOfSelectedChannel$: Observable<any>;
  channel;//localStorage
  showChannelChat: boolean = false
  showChat: boolean = false;
  emojisContainerVisible: boolean = false;
  emojisReactionContainerVisible: boolean = false;
  isHovered: boolean = false;
  message: any = '';
  selectedRecipient: string;
  chats: any;
  answersAmount: number;
  length: number;
  i: number = 0;
  dialogRef: MatDialogRef<any>;
  groupedChats: any[] = [];
  directMessageDates: number[] = [];
  lastDisplayedDate: Date | null = null;
  selectedChannel: any;
  prevChat: any;
  private chatCount = 0;
  public selectedChannelChat: any = null;
  emojis: string[] = [
    "❤️", "✅", "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
    "🙂", "🙃", "😉", "😌", "😍", "😘", "😗", "😙", "😚", "😋",
    "😛", "😜", "😝", "🤤", "😎", "🤩", "😏", "😒", "😞", "😔",
    "😖", "😢", "😭", "😓", "😪", "😥", "😰", "😩", "😫", "😤",
    "😠", "😡", "🤬", "🤯", "😳", "🥺", "😨", "😰", "😥", "😓",
    "🤗", "🙄", "😬", "😐", "😯", "😦", "😧", "😮", "😲", "🥴",
    "🤐", "🤫", "😵", "🥵", "🥶", "🥳", "😎", "🤓", "🧐", "😕",
    "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺", "😦", "😧",
    "😨", "😰", "😥", "😪", "😓", "😔", "😞", "😒", "😩", "😫",
    "😤", "😠", "😡", "🤬", "🤯", "🤢", "🤮", "🤧", "😊", "😇",
  ];

  displayedEmojis: string[] = [];

  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private chatService: ChatService,
    private channelService: ChannelService,
    private dialog: MatDialog) {
    this.loadMoreEmojis();
    this.directMessageDates = [];
  }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.getUsers();
    this.getChannelChats();
    this.lastDisplayedDate = null;
  }

  getMembers() {
    this.channelMembers$ = collectionData(this.channelCollection, { idField: 'id' });
    this.filteredChannelMembers$ = this.channelMembers$.pipe(
      map(channels => channels.filter(channel => '# ' + channel.name == this.channel))
    );
    this.filteredChannelMembers$.subscribe(data => {
      this.length = data[0].members.length
    });
  }

  openDialogAddMembers() {
    const dialogConfig = new MatDialogConfig();
    const dialogRef = this.dialog.open(DialogAddMembersComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openDialogShowEmojis() {
    this.emojisContainerVisible = !this.emojisContainerVisible;
  }

  closeDialogEmoji() {
    this.emojisContainerVisible = false;
  }

  emojiSelected(emoji: string) {
    this.message += emoji;
    setTimeout(() => {
      this.emojisContainerVisible = true;
    }, 1);
  }

  isDifferentDate(chat, index) {
    if (chat.receiver || chat.sender) {
      const timeStampInSeconds = chat.timeStamp;
      if (!this.directMessageDates.includes(timeStampInSeconds)) {
        this.directMessageDates.push(timeStampInSeconds);
      }
      if (index > 0) {
        return this.checkDateDirectChat(chat, index);
      } else if (index === 0) {
        this.chatCount++;
        return true;
      }
    }
    return this.checkDateChannelChat(chat, index);
  }

  checkDateDirectChat(chat, index) {
    const timeStampInSeconds = chat.timeStamp;
    if (!this.directMessageDates.includes(timeStampInSeconds)) {
      this.directMessageDates.push(timeStampInSeconds);
    }
    if (index > 0) {
      const chatDate = new Date(timeStampInSeconds * 1000);
      const prevTimeStampInSeconds = this.directMessageDates[index - 1];
      const prevChatDate = new Date(prevTimeStampInSeconds * 1000);
      const differentDate =
        chatDate.getFullYear() !== prevChatDate.getFullYear() ||
        chatDate.getMonth() !== prevChatDate.getMonth() ||
        chatDate.getDate() !== prevChatDate.getDate();
      return differentDate;
    }
    return false;
  }

  checkDateChannelChat(chat, index) {
    if ( index == 0){
      const chatDate = new Date(chat.chats[index].timeStamp * 1000);
      return chatDate;
    } else if (index > 0 && chat.chats && chat.chats[index] && chat.chats[index - 1]) {
      const chatDate = new Date(chat.chats[index].timeStamp * 1000);
      const prevChatDate = new Date(chat.chats[index - 1].timeStamp * 1000);
      const differentDate =
        chatDate.getFullYear() !== prevChatDate.getFullYear() ||
        chatDate.getMonth() !== prevChatDate.getMonth() ||
        chatDate.getDate() !== prevChatDate.getDate();
      return differentDate;
    }
    return false;
  }


  formatDate(timeStamp: number): string {
    const chatDate = new Date(timeStamp * 1000);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const todayDate = new Date(currentDate);
    const yesterdayDate = new Date(currentDate);
    yesterdayDate.setDate(currentDate.getDate() - 1);
    if (chatDate >= todayDate) {
      return 'Heute';
    } else if (chatDate >= yesterdayDate) {
      return 'Gestern';
    } else {
      const day = chatDate.getDate();
      const monthNames = [
        'Jan', 'Feb', 'März', 'Apr', 'Mai', 'Jun',
        'Jul', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'
      ];
      const dayNames = [
        'So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'
      ];
      const month = monthNames[chatDate.getMonth()];
      const dayName = dayNames[chatDate.getDay()];
      return `${dayName}, ${day} ${month}`;
    }
  }

  async deleteChat(selectedChat) {
    const channelId = this.selectedChannel.id;
    const chatToRemove = selectedChat;
    if (this.loggedUser.name === chatToRemove.sender) {
      const channelDocRef = doc(this.firestore, 'channels', channelId);
      const channelDocSnapshot = await getDoc(channelDocRef);
      if (channelDocSnapshot.exists()) {
        const chatsArray = channelDocSnapshot.data()['chats'];
        if (chatsArray) {
          const updatedChatsArray = chatsArray.filter(chat => chat.id !== chatToRemove.id);
          await setDoc(channelDocRef, { chats: updatedChatsArray }, { merge: true });
          this.chatsChannel$ = collectionData(this.channelCollection, { idField: 'id' });
        }
      }
      await deleteDoc(doc(this.chatCollection, selectedChat.id));
    }
    document.getElementById('thread')?.classList.add('d-none');
  }

  setSelectedRecipient() {
    const chatField = document.getElementById('textarea') as HTMLTextAreaElement;
    chatField.placeholder = 'Nachricht an ' + this.channel;
  }

  postChat() {
    const channel = localStorage.getItem('channel')
    const recipient = localStorage.getItem('selected-recipient');
    if (channel == recipient) {
      this.channelService.postChat(this.message, this.selectedChannel)
    } else {
      this.chatService.postChat(this.message, this.loggedUser, recipient);
    }
    this.message = '';
  }

  getUsers() {
    const usersObservable = collectionData(this.usersCollection, { idField: 'id' });
    usersObservable.subscribe((usersArray) => {
      this.users = usersArray;
    });
  }

  ngOnDestroy(): void {
    this.firebase.setLogoVisible(false);
  }

  loadLoggedUserData() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.loggedUser.avatar = userData.avatar;
      this.loggedUser.name = userData.name;
    }
  }

  startChat() {
    this.getChats()
  }

  showFunction(channel) {
    this.selectedChannel = channel
    this.getChannelChats()
  }

  getChats() {
    this.showChannelChat = false;
    this.showChat = true;
    this.chat = localStorage.getItem('selected-recipient');
    this.chats$ = collectionData(this.chatCollection, { idField: 'id' });
    this.chats$ = this.chats$.pipe(
      map(chats => chats.filter(chat => (chat.sender == this.loggedUser.name && chat.receiver == this.chat) || (chat.receiver == '@ ' + this.loggedUser.name && '@ ' + chat.sender == this.chat))),
      map(chats => chats.sort((a, b) => a.timeStamp - b.timeStamp))
    );
    this.chats$.subscribe((chats) => {
      setTimeout(() => {
        this.scrollToBottom()
      }, 200);
    });
  }

  getChannelChats() {
    document.getElementById('thread')?.classList.add('d-none');
    this.showChat = false;
    this.showChannelChat = true;
    this.channel = localStorage.getItem('channel');
    this.chatsChannel$ = collectionData(this.channelCollection, { idField: 'id' });

    this.chatsChannel$.subscribe((chats) => {
      if (this.channel) {
        this.selectChannel(chats, this.channel);
      } else if (chats.length > 0) {
        this.channel = '# ' + chats[0].name;
        localStorage.setItem('selected-recipient', this.channel);
        this.setSelectedRecipient();
        this.selectChannel(chats, this.channel);
      }
      setTimeout(() => {
        this.scrollToBottom();
      }, 200);
      this.getMembers();
    });
    this.setSelectedRecipient();
  }

  selectChannel(chats, selectedChannel) {
    localStorage.setItem('channel', selectedChannel);
    this.selectedRecipient = selectedChannel;
    this.chatsChannel$ = this.chatsChannel$.pipe(
      map(chats => chats.filter(chat => '# ' + chat.name == selectedChannel)),
    );
    this.chatsChannel$.subscribe((chats) => {
      this.selectedChannel = chats[0];
    });
  }

  showChatIcons(i: number) {
    document.getElementById(`chat-icon-frame${i}`).style.visibility = 'visible';
  }

  hideChatIcons(i: number) {
    document.getElementById(`chat-icon-frame${i}`).style.visibility = 'hidden';
  }

  emojiSelectedReactionChat(emoji, chat) {
    this.reaction.emoji = [];
    const date = new Date();
    this.reaction.timeStamp = date.getTime();
    this.reaction.emoji.push(emoji);
    this.reaction.sender = this.loggedUser.name;
    this.chatService.postReaction(this.reaction, chat);
  }

  scrollToBottom() {
    const contentFrame = document.getElementById('content-frame');
    if (contentFrame) {
      contentFrame.scrollTop = contentFrame.scrollHeight;
    }
  }

  openThread(chat: any) {
    console.log('opened')
    const data = {
      chat: chat,
      selectedChannel: this.selectedChannel
    }
    if (!this.selectedChannel) {
      data.selectedChannel = this.selectedChannel
    }
    this.contentClicked.emit(JSON.stringify(data));
    document.getElementById('thread')?.classList.remove('d-none');
    event.stopPropagation()
  }

  openDialogchannelInfo() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
    }
    const dialogRef = this.dialog.open(DialogChannelInfoComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openShowReaction(i) {
    document.getElementById(`emojis-container-chat${i}`).style.visibility = 'visible';
  }

  closeShowReaction(i) {
    document.getElementById(`emojis-container-chat${i}`).style.visibility = 'hidden';
  }

  loadMoreEmojis() {
    const startIndex = this.displayedEmojis.length;
    const endIndex = startIndex + 10;

    if (startIndex < this.emojis.length) {
      const newEmojis = this.emojis.slice(startIndex, endIndex);
      this.displayedEmojis = this.displayedEmojis.concat(newEmojis);
    }
  }
}

