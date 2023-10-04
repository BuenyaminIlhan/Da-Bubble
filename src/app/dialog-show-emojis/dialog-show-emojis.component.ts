import { Component } from '@angular/core';
import * as emojione from 'emojione';
import { SharedEmojiServiceService } from '../services/shared-emojis/shared-emoji.service.service';


@Component({
  selector: 'app-dialog-show-emojis',
  templateUrl: './dialog-show-emojis.component.html',
  styleUrls: ['./dialog-show-emojis.component.scss']
})
export class DialogShowEmojisComponent {
  emojis: string[] = [
    "❤️", "😀", "😍", "👍", "👎", "👌", "🙌", "👏", "😂", "😊",
    "😎", "😜", "😋", "😘", "😆", "🤣", "😇", "😉", "🤗", "🤔",
    "🙄", "😒", "😳", "😌", "😢", "😭", "😩", "😡", "😱", "🤩",
    "🥰", "😅", "🥳", "😤", "😴", "🤯", "😪", "🤕", "🤒", "😮",
    "😬", "😵", "🥴", "🤐", "🤨", "😐", "😑", "😕", "🤓", "🎉",
  ];
  
  constructor(private sharedEmojiServiceService: SharedEmojiServiceService) {}

  emojiSelected(emoji: string) {
    // Hier können Sie auf die Auswahl des Emojis reagieren
    console.log('Ausgewähltes Emoji:', emoji);
    this.sharedEmojiServiceService.setSelectedEmoji(emoji);
    // Fügen Sie Ihren Verarbeitungscode hier ein
  }
  emojione = emojione;
}
