/* eslint-disable eqeqeq */
/* eslint-disable no-mixed-operators */
import React from 'react';
import ReactDOM from 'react-dom';
import { Prism } from 'prism-react-renderer';
import marked from 'marked';
import '../node_modules/font-awesome/css/font-awesome.min.css';
import './index.css'
const buttonTypes = {
  'fa fa-square-o': '- [ ] ',
  'fa fa-check-square':'- [x] ',
  'fa fa-bold': '**',
  'fa fa-italic': '_',
  'fa fa-quote-right': '> ',
  'fa fa-link': '[Link]',
  'fa fa-picture-o': '![Alt Text]',
  'fa fa-list-ol': '1. ',
  'fa fa-list': '- ',
  'fa fa-code': '`'
};
const buttonStyles = {
  'fa fa-check-square':'Checked Checkbox',
  'fa fa-square-o': 'Unchecked Checkbox',
  'fa fa-bold': 'Strong Text',
  'fa fa-italic': 'Emphasized Text',
  'fa fa-quote-right': 'Block Quote',
  'fa fa-link': '(https://)',
  'fa fa-picture-o': '(https://)',
  'fa fa-list-ol': 'List Item',
  'fa fa-list': 'List Item',
  'fa fa-code': 'Inline Code',
};
// ALLOWS LINE BREAKS WITH RETURN BUTTON
marked.setOptions({
  breaks: true,
  highlight: function (code) {
    return Prism.highlight(code, Prism.languages.javascript, "javascript");
  },
});

// INSERTS target="_blank" INTO HREF TAGS (required for Codepen links)
const renderer = new marked.Renderer();
renderer.link = function (href, title, text) {
  return `<a target="_blank" href="${href}">${text}</a>`;
};

class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markdown: placeholder,
      lastBtnClicked: null,
    }
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
      handleChange(event) {
        this.setState({
          markdown: event.target.value,
          lastBtnClicked: ''
        });
        sessionStorageManager.save('style', '')
      }
      insertAtCursor(textValue) {
        let textField = document.getElementsByTagName('textarea').item(0)
        if(document.selection) {
          textField.focus();
          var selected = document.selection.createRange();
          selected.text = textValue
        }else if (textField.selectionStart || textField.selectionStart === 0) {
          let startPos = textField.selectionStart;
          sessionStorageManager.save('position', startPos)
          let endPos = textField.selectionEnd;
          let index = /[^'>*_\s(1. )]/i.exec(textValue).index;
          textField.value = textField.value.substring(0, startPos) + textValue + textField.value.substring(endPos, textField.value.length);
          textField.focus()
          switch(textValue) {
            case '> Block Quote':
            case '- List Item':
            case '1. List Item':
              this.setTextSelection(startPos + index, startPos + textValue.length);
              break;
            case '[Link](https://)':
              this.setTextSelection(startPos + 7 , startPos + textValue.length - 1);
              break;
            case '![Alt Text](https://)':
              this.setTextSelection(startPos + 12, startPos + textValue.length - 1);
              break;
            case '- [x] Checked Checkbox':
            case '- [ ] Unchecked Checkbox':
              this.setTextSelection(startPos + 6, startPos + textValue.length)
            break;
            default:
              this.setTextSelection(startPos + index, startPos + textValue.length - index)
          }
        }else {
          textField.value += textValue;
        }
      }
      getSelectionText() {
        let text = '';
        let textField = document.getElementsByTagName('textarea').item(0);
        text = textField.value.slice(textField.selectionStart, textField.selectionEnd);
        return text
      }

      setTextSelection(startingChar, endingChar) {
        let textField = document.getElementsByTagName('textarea').item(0);
        if(startingChar === -1) {
          startingChar = sessionStorageManager.get('position');
          textField.setSelectionRange(startingChar, startingChar)
        }else if(textField.selectionStart) {
          textField.focus()
          textField.setSelectionRange(startingChar, endingChar);
        }else textField.focus()
      }
    insertAt(_stylePhrase, buttonTypes) {
      setTimeout(() => this.insertAtCursor(_stylePhrase), 100);
      sessionStorageManager.save('insert', _stylePhrase);
      sessionStorageManager.save('style', buttonTypes);
      this.setState({lastBtnClicked: 'insert'})
    }

    Highlighted(_className, _lastStyle, _startPos, _symbol) {
      return _lastStyle != _className || _lastStyle == _className && _startPos != parseInt(sessionStorage.getItem('lastStartPos'), 10) + _symbol.length && _className != 'fa fa-link' && _startPos != parseInt(sessionStorage.getItem('lastStartPos'), 10) 
      + _symbol.length && _className != 'fa fa-picture-o'
    }

    handleClick(event) {
        let symbol = buttonTypes[event.target.className];
        let style = buttonStyles[event.target.className]
        let stylePhrase = event.target.className == 'fa fa-bold' || event.target.className == 'fa fa-italic' ||
        event.target.className == 'fa fa-code' ? symbol + style + symbol : symbol + style; 
        let textField = document.getElementsByTagName('textarea').item(0);
        textField.focus()
        let selectedText = this.getSelectionText();
        let startPos = textField.selectionStart;
        let endPos = textField.selectionEnd;
        let usersLink = sessionStorageManager.get('usersLink');
        let lastStyle = sessionStorageManager.get('style');
        
          sessionStorageManager.insertCaretStore(
          startPos + symbol.length, endPos + symbol.length, 
          startPos, endPos, endPos + 3, 
          endPos + 10, startPos - 3, '', startPos - 4,
          endPos + 4, endPos + 11);
          
          if (this.state.lastBtnClicked === 'insert' || this.state.lastBtnClicked === 'undo insert') {
            if (this.state.lastBtnClicked === 'insert' && lastStyle === event.target.className) {
              this.setState({
                markdown: textField.value.replace(sessionStorage.getItem('insert'), ''), 
                lastBtnClicked: 'undo insert'
              });
              setTimeout(() => this.setTextSelection(-1, -1), 100);
            }else {
              this.insertAt(stylePhrase, event.target.className);
            }
          }else if (selectedText !== '') {
            if (this.Highlighted(event.target.className, lastStyle, startPos, symbol)) {
              sessionStorageManager.selectionCaretStore(event.target.className, startPos, selectedText);
              this.setState({
                markdown: event.target.className === 'fa fa-link' ? this.state.markdown.substring(0, startPos) + `[${selectedText}]` + style + this.state.markdown.substring(endPos, textField.value.length) : event.target.className === 'fa fa-picture-o' ? this.state.markdown.substring(0, startPos) + `![${selectedText}]` + style + this.state.markdown.substring(endPos, textField.value.length) :
                event.target.className == 'fa fa-quote-left' ||
                event.target.className == 'fa fa-list-ol' ||
                event.target.className == 'fa fa-square-o' || event.target.className == 'fa fa-list' || event.target.className == 'fa fa-check-square'  ?  this.state.markdown.substring(0, startPos) + symbol + selectedText + this.state.markdown.substring(endPos, textField.value.length) : this.state.markdown.substring(0, startPos) + symbol + selectedText + symbol + this.state.markdown.substring(endPos, textField.value.length), lastBtnClicked: 'highlight'
              });
            }else {
              sessionStorageManager.selectionCaretStore("", "", "");
              this.setState({
              markdown: event.target.className === 'fa fa-link' ? this.state.markdown.substring(0, startPos - 3 - usersLink.length) + usersLink + this.state.markdown.substring(endPos + 1, textField.value.length) :
              event.target.className === 'fa fa-picture-o' ? this.state.markdown.substring(0, startPos - 4 - usersLink.length) + usersLink
              + this.state.markdown.substring(endPos + 1, textField.value.length) :  event.target.className == 'fa fa-quote-left' || 
              event.target.className == 'fa fa-list-ol' || 
              event.target.className == 'fa fa-list' ?    
              this.state.markdown.substring(0, startPos - symbol.length) + selectedText + 
              this.state.markdown.substring(endPos, textField.value.length) :
              this.state.markdown.substring(0, startPos - symbol.length) + selectedText + 
              this.state.markdown.substring(endPos + symbol.length, textField.value.length),
              lastClicked: 'undo' });
            }
        if (event.target.className == 'fa fa-link' && this.state.lastClicked != 'highlight') { 
          sessionStorageManager.save('usersLink', selectedText); 
          setTimeout( () => this.setTextSelection(sessionStorageManager.get('linkStart'), 
          sessionStorageManager.get('linkEnd')), 100);

        } else if (event.target.className == 'fa fa-link') { 
          setTimeout( () => this.setTextSelection(sessionStorageManager.get('undoLinkStart'), 
          sessionStorageManager.get('undoLinkEnd')), 100);
          sessionStorageManager.save('undoLinkStart', startPos - 3 - usersLink.length);
          
        } else if (event.target.className == 'fa fa-picture-o' && this.state.lastBtnClicked != 'highlight') { 
          sessionStorageManager.save('usersLink', selectedText); 
          setTimeout( () => this.setTextSelection(sessionStorageManager.get('imgLinkStart'), 
          sessionStorageManager.get('imgLinkEnd')), 100);
          
        } else if (event.target.className == 'fa fa-picture-o') { 
          setTimeout( () => this.setTextSelection(sessionStorageManager.get('undoImgStart'), 
          sessionStorageManager.get('undoImgEnd')), 100);
          sessionStorageManager.save('undoImgStart', startPos - 4 - usersLink.length);
          
        } else if (event.target.className == lastStyle && selectedText != sessionStorageManager.get('lastSelection')) { 
          setTimeout( () => this.setTextSelection(sessionStorageManager.get('undoStart') - symbol.length, 
          sessionStorageManager.get('undoEnd') - symbol.length), 100);
          
        } else {
          setTimeout( () => this.setTextSelection(sessionStorageManager.get('startPos'), 
          sessionStorageManager.get('endPos')), 100);
        }
        
      } else {  
        this.insertAt(stylePhrase, event.target.className); 
      }
  }
    render() {
      return (
        <div className="hello">
          <div className="editor-container">
            <Editor onChange={this.handleChange} markdown={this.state.markdown} onClick={this.handleClick} onDoubleClick={this.handleEditorChange}/>
          </div>
          <div className="preview-container">
            <Preview markdown={this.state.markdown} />
          </div>
        </div>
      );
    }
    };

const Editor = (props) => {
  return (
    <div className="editor" id="ed">
      
      <div id="editor-header" >
        <div className="icons">
        <i className="fa fa-bold" title="Bold" aria-hidden="true" onClick={props.onClick} />
        <i className="fa fa-list" title="Bulleted List" aria-hidden="true" onClick={props.onClick} />
        <i className="fa fa-quote-right" aria-hidden="true" title="Block Quote" onClick={props.onClick} />
        <i className="fa fa-italic" title="Italic" aria-hidden="true" onClick={props.onClick} />
        <i className="fa fa-code" title="Inline Code" aria-hidden="true" onClick={props.onClick} />
        <i className="fa fa-check-square" title="Checked Checkbox" aria-hidden="true" onClick={props.onClick} />
        <i className="fa fa-square-o" title="Unchecked Checkbox" aria-hidden="true" onClick={props.onClick} />
        <i className="fa fa-list-ol" title="Numbered List" aria-hidden="true" onClick={props.onClick} />
        <i className="fa fa-picture-o" title="Picture" aria-hidden="true" onClick={props.onClick} />
        <i className="fa fa-link" title="Link" aria-hidden="true" onClick={props.onClick} />
        </div>
      </div>
      <textarea
        id="editor"
        type="text"
        onChange={props.onChange}
        value={props.markdown}
      />
    </div>
  );
};

const Preview = (props) => {
  return (
    <div className="previewer">
      <div id="preview-header">
        <div className="prev-icons">
          <h2>Previewer</h2>
        </div>
      </div>
      <div
        dangerouslySetInnerHTML={{
          __html: marked(props.markdown, { renderer: renderer }),
        }}
        id="preview"
      />
    </div>
  );
};
class SessionStorageManager {
  insertCaretStore(n1, n2, n3, n4, n5, n6, n7, n8, n9, n10, n11){
    this.n1 = sessionStorage.setItem('startPos', n1);
    this.n2 = sessionStorage.setItem('endPos', n2);
    this.n3 = sessionStorage.setItem('undoStart', n3);
    this.n4 = sessionStorage.setItem('undoEnd', n4);
    this.n5 = sessionStorage.setItem('linkStart', n5);
    this.n6 = sessionStorage.setItem('linkEnd', n6);
    this.n7 = sessionStorage.setItem('undoLinkEnd', n7);
    this.n8 = sessionStorage.setItem('usersLink', n8);
    this.n9 = sessionStorage.setItem('undoImgEnd', n9);
    this.n10 = sessionStorage.setItem('imgLinkStart', n10);
    this.n11 = sessionStorage.setItem('imgLinkEnd', n11);
  }
  selectionCaretStore(n12, n13, n14){
    this.n12 = sessionStorage.setItem('style', n12);
    this.n13 = sessionStorage.setItem('lastStartPos', n13);
    this.n14 = sessionStorage.setItem('lastSelection', n14);
  }
  
  save(key, item){
   return sessionStorage.setItem(key, item);
  }
  
  get(key){
    return sessionStorage.getItem(key);
  }
}

const sessionStorageManager = new SessionStorageManager();

const placeholder = `# Welcome to Markdown.   
***
## This is a Sub-heading.
***
### Just Keeps Going.
***

**Are you caught up by now? I hope you are!**

> This is a blockquote.
>
> Make it multi-line.
>> Or even better nest another blockquote inside.
>>> And inside that one too.

Blockquotes are fun but when you want to make a documentation.
You need to write  code like, \`<div></div>\`,       


\`\`\` 
//Make it multi-line.

const yourFunction = (firstLine, secondLine) => {
  return{
    firstLine: "\`\`\`",
    secondLine: "\`\`\`"
  }
}
\`\`\`

- You can also do tables:

First Column | Second | Third | Forth
------------ | ------------- | ------------- | -------------
Your content can | be here, and it | can be here.... | can be here....
And here. | Okay. | I think we get it. | can be here....

- [x] List are a thing too
- [ ] With Check Boxes!
- [X] Wait Whaah!

+ One
+ Two
+ Three
    - Nested One
        - Nested Two

- Done with unordered  lists? Well there's also Ordered Lists.
1. One
2. Two
3. Three
    1. Nested One
        1. Nested Two
        2. Nested Three

- You can use only 1s too? Lol.
1. Yeap
1. Yes
1. Okay I'm done.
- Last but not least, [LINKS](https://codepen.io/Fierceincii/)
![custom picture](https://c4.wallpaperflare.com/wallpaper/384/350/430/digital-art-artwork-cyber-cyberpunk-neon-hd-wallpaper-preview.jpg)
`;
ReactDOM.render(<MyComponent />, document.getElementById("root"));
