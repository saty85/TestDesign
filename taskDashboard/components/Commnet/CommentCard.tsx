import * as React from 'react';
import { Web } from "sp-pnp-js";
//import '../../webparts/cssFolder/foundation.scss'
//import '../../webparts/cssFolder/foundationmin.scss';
import '../foundation.scss';
import '../foundationmin.scss';
import './CommentStyle.scss'
import { Modal } from 'office-ui-fabric-react';
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { MentionsInput, Mention } from 'react-mentions';
import mentionClass from './mention.module.scss';
import "@pnp/sp/sputilities";
import { sp } from "@pnp/sp";
 
export interface ICommentCardProps {
  siteUrl? : string;
  userDisplayName? : string;
  listName? : string;
  itemID? : number;
  Context?:any;
}

export interface ICommentCardState {  
  Result : any;
  listName : string;
  itemID : number;
  CommenttoPost : string;
  updateComment: boolean;
  isModalOpen: boolean;
  AllCommentModal: boolean;
  mentionValue: string;
}

export class CommentCard extends React.Component<ICommentCardProps, ICommentCardState> {
  private taskUsers : any = [];
  private currentUser: any;
  private mentionUsers:any=[];
  private topCommenters:any=[];

  private params1:any;
  constructor(props:ICommentCardProps){
    super(props);
     this.params1 = new URLSearchParams(window.location.search);  
    
    this.state ={
      Result:{},
      listName: (this.params1.get('Site')  !=undefined ? this.params1.get('Site'):  props.listName),
      itemID : (this.params1.get('taskId')  != undefined ? Number(this.params1.get('taskId')): props.itemID),
    
      CommenttoPost: '',
      updateComment: false,
      isModalOpen: false,
      AllCommentModal: false,
      mentionValue:''
    }
    this.GetResult();    
    console.log(this.props.Context);
    sp.setup({
      spfxContext: this.props.Context
    }); 
    
  }

  private async GetResult() {
    let web = new Web(this.props.siteUrl);
    let taskDetails = [];    
    taskDetails = await web.lists
      .getByTitle(this.state.listName)
      .items
      .getById(this.state.itemID)
      .select("ID","Title","Status","Team_x0020_Members/Title","PercentComplete","Priority","Created","Author/Title","Author/EMail","Editor/Title","component_x0020_link","FeedBack","Responsible_x0020_Team/Title","SharewebTaskType/Title","Comments","Modified")
      .expand("Team_x0020_Members","Author","Editor","Responsible_x0020_Team","SharewebTaskType")
      .get()      
   
    await this.GetTaskUsers();

    this.currentUser = this.GetUserObject(this.props.Context.pageContext.user.displayName);

    let tempTask = {      
      ID: 'T'+taskDetails["ID"],
      Title: taskDetails["Title"],      
      Status: taskDetails["Status"],
      TeamLeader: taskDetails["Responsible_x0020_Team"] != null ? this.GetUserObjectFromCollection(taskDetails["Responsible_x0020_Team"]) : null,
      TeamMembers: taskDetails["Team_x0020_Members"] != null ? this.GetUserObjectFromCollection(taskDetails["Team_x0020_Members"]) : null,
      PercentComplete: taskDetails["PercentComplete"],
      Priority: taskDetails["Priority"],
      Created:  taskDetails["Created"] != null ? (new Date(taskDetails["Created"])).toLocaleDateString() : '',
      Modified:  taskDetails["Modified"] != null ? (new Date(taskDetails["Modified"])).toLocaleDateString() : '',
      ModifiedBy: this.GetUserObjectArr(taskDetails["Editor"]),
      Author: this.GetUserObjectArr(taskDetails["Author"]),
      component_url: taskDetails["component_x0020_link"],     
      Comments: JSON.parse(taskDetails["Comments"]),
      FeedBack: JSON.parse(taskDetails["FeedBack"]),
      SharewebTaskType : taskDetails["SharewebTaskType"] !=null ? taskDetails["SharewebTaskType"].Title : ''      
    };    
    
    if (tempTask["Comments"] != undefined && tempTask["Comments"].length > 0){
      tempTask["Comments"].sort(function(a:any, b:any) {
        let keyA = a.ID,
          keyB = b.ID;
        // Compare the 2 dates
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
      });
    }   
    
    this.setState({
      Result : tempTask
    });
  }

  private GetUserObjectFromCollection(UsersValues:any){  
    let userDeatails = [];
    for (let index = 0; index < UsersValues.length; index++) {
      let senderObject = this.taskUsers.filter(function (user:any, i:any){ 
        if (user.AssingedToUser != undefined){
          return user.AssingedToUser['Title'] == UsersValues[index].Title
        }
      });
      if (senderObject.length > 0){
          userDeatails.push({
            'Id' : senderObject[0].Id,
            'Name' : senderObject[0].Email,
            'Suffix' : senderObject[0].Suffix,
            'Title' : senderObject[0].Title,
            'userImage': senderObject[0].Item_x0020_Cover.Url
          })
        }
      }
    return userDeatails;
  }

 
  private async GetTaskUsers(){
    let web = new Web(this.props.siteUrl);
    let taskUsers = [];    
    taskUsers = await web.lists
      .getByTitle('Task Users')
      .items
      .select('Id','Email','Suffix','Title','Item_x0020_Cover','AssingedToUser/Title','AssingedToUser/EMail')
      .filter("ItemType eq 'User'")
      .expand('AssingedToUser')
      .get();    
    this.taskUsers = taskUsers; 
       
      for (let index = 0; index < this.taskUsers.length; index++) {
        this.mentionUsers.push({
          id : this.taskUsers[index].Title+"{"+this.taskUsers[index].Email+"}",
          display: this.taskUsers[index].Title
        });
        
        if (this.taskUsers[index].Title =="Deepak Trivedi"  || this.taskUsers[index].Title =="Stefan Hochhuth"  || this.taskUsers[index].Title =="Robert Ungethuem"  || this.taskUsers[index].Title =="Mattis Hahn" ){
          this.topCommenters.push({
            id : this.taskUsers[index].Title+"{"+this.taskUsers[index].Email+"}",
            display: this.taskUsers[index].Title,
            Title:this.taskUsers[index].Title,
            ItemCoverURL: (this.taskUsers[index].Item_x0020_Cover != undefined) ? 
                              this.taskUsers[index].Item_x0020_Cover.Url :
                              "https://hhhhteams.sharepoint.com/sites/HHHH/SiteCollectionImages/ICONS/32/icon_user.jpg"
          })
        }
      }       
      console.log(this.topCommenters);
      console.log(this.mentionUsers);
  }

  private handleInputChange(e:any){
    this.setState({CommenttoPost: e.target.value}); 
   }

  private async PostComment(txtCommentControlId:any){
    

    let txtComment = this.state.CommenttoPost;
    if (txtComment != ''){
      let temp = {
        AuthorImage: this.currentUser['userImage'] != null ? this.currentUser['userImage'] : '', 
        AuthorName: this.currentUser['Title'] != null ? this.currentUser['Title'] : '', 
        Created: (new Date().toLocaleString('default', { day:'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })).replace(',',''),
        Description:txtComment,
        Header: this.GetMentionValues(),
        ID: this.state.Result["Comments"] != undefined ? this.state.Result["Comments"].length + 1 : 1,
        Title: txtComment,
        editable: false
      };
      //Add object in feedback
      
      if (this.state.Result["Comments"] != undefined){
        this.state.Result["Comments"].push(temp);
      }
      else{
        this.state.Result["Comments"] = [temp];
      }
      
      this.state.Result["Comments"].sort(function(a:any, b:any) {
        let keyA = a.ID,
          keyB = b.ID;
        // Compare the 2 dates
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
      });
      
      console.log(this.state.Result);
      
      (document.getElementById(txtCommentControlId) as HTMLTextAreaElement).value = '';
      
      let web = new Web(this.props.siteUrl);
      
      const i = await web.lists.getByTitle(this.state.listName)
              .items
              .getById(this.state.itemID).update({
                Comments: JSON.stringify(this.state.Result["Comments"])
              });
      
      this.setState({ 
          updateComment: true
      },()=>this.GetEmailObjects());      

      this.setState({ 
        updateComment: true,
        CommenttoPost: '',
        mentionValue:''
      });  
      
      

    }else{
      alert('Please input some text.')
    }  
    
  } 

  private GetMentionValues(){
    let mention_str='';
    if (this.state.mentionValue != ''){
      let regExpStr = this.state.mentionValue;
      let regExpLiteral = /\[(.*?)\]/gi;
      let allMention = regExpStr.match(regExpLiteral);
      if (allMention.length>0){
        for (let index = 0; index < allMention.length; index++) {
          mention_str += allMention[index].replace('[','@').replace(']','').trim() + ' ';          
        }        
      }
    }
    return mention_str.trim();
  }

  private GetUserObjectArr(username:any){
    let userDeatails = [];
    let senderObject = this.taskUsers.filter(function (user:any, i:any){ 
      if (user.AssingedToUser != undefined ){
        
        return user.AssingedToUser['Title'] == username.Title || user.AssingedToUser['Title'] == "SPFx Developer1"
      
      }
      });
      if (senderObject.length > 0){
          userDeatails.push({
            'Id' : senderObject[0].Id,
            'Name' : senderObject[0].Email,
            'Suffix' : senderObject[0].Suffix,
            'Title' : senderObject[0].Title,
            'userImage': senderObject[0].Item_x0020_Cover.Url
          })
        }    
    return userDeatails;
  }

  private GetUserObject(username:any){
    let userDeatails = {};
    let senderObject = this.taskUsers.filter(function (user:any, i:any){ 
      if (user.AssingedToUser != undefined){
        return user.AssingedToUser['Title'] == username
      }
      
    });
      if (senderObject.length > 0){
          userDeatails = {
            'Id' : senderObject[0].Id,
            'Name' : senderObject[0].Email,
            'Suffix' : senderObject[0].Suffix,
            'Title' : senderObject[0].Title,
            'userImage': senderObject[0].Item_x0020_Cover.Url
          }
        }    
    return userDeatails;
  }

  private async clearComment(indexOfDeleteElement:any){
    if (confirm('Are you sure, you want to delete this?')){
      this.state.Result["Comments"].splice(indexOfDeleteElement,1);    
    let web = new Web(this.props.siteUrl);      
    const i = await web.lists.getByTitle(this.state.listName)
              .items
              .getById(this.state.itemID).update({
                Comments: JSON.stringify(this.state.Result["Comments"])
              });
      
    this.setState({ 
        updateComment: true
    });
    }     
  }
  private openEditModal(indexOfDeleteElement:any){
    this.setState({
      isModalOpen : true
    })
  }

  private openAllCommentModal(){
    this.setState({
      AllCommentModal : true
    })
  }

  private closeAllCommentModal(e:any){
    e.preventDefault();
    this.setState({
      AllCommentModal : false
    })
  }

  //close the model
  private CloseModal(e:any) {
    e.preventDefault();
    this.setState({ 
      isModalOpen:false
    });
  }

  private topCommentersClick(e:any){
    console.log(e.currentTarget.className);
    if (e.currentTarget.className.indexOf('active')<0){
      e.currentTarget.classList.add('active');
      this.setState({
        mentionValue : this.state.mentionValue + '@['+ e.currentTarget.title +']('+ e.currentTarget.id + ') '
      }, ()=>{console.log(this.state.mentionValue)})
    }
    
  }

  private setMentionValue(e:any){
    this.setState({
      mentionValue:e.target.value
    },()=>{ console.log(this.state.mentionValue) })    
  }

  private GetEmailObjects(){
   
    if (this.state.mentionValue != ''){
      //Get All To's
      let mention_To:any=[];
      let regExpStr = this.state.mentionValue;
      let regExpLiteral = /\{(.*?)\}/gi;
      let allMention = regExpStr.match(regExpLiteral);
      if (allMention.length>0){
        for (let index = 0; index < allMention.length; index++) {
          /*For Prod when mail is open for all
          if (allMention[index].indexOf(null)<0){
            mention_To.push(allMention[index].replace('{','').replace('}','').trim());   
          } 
          */
           /*testing*/
           if (allMention[index].indexOf('mitesh.jha@hochhuth-consulting.de')>0 || allMention[index].indexOf('ranu.trivedi@hochhuth-consulting.de')>0){
            mention_To.push(allMention[index].replace('{','').replace('}','').trim());   
            }                      
          }        
      
      console.log(mention_To);
      if (mention_To.length > 0){
        let emailprops = {
          To:mention_To,
          Subject :"["+this.params1.get('Site')+" - Comment by "+ this.props.Context.pageContext.user.displayName +"] " + this.state.Result["Title"],
          Body:this.state.Result["Title"]
        }
        console.log(emailprops);
        
        this.SendEmail(emailprops);      
                    
        }      
      }
    }
  }

  private BindHtmlBody(){
    let body= document.getElementById('htmlMailBody')
    console.log(body.innerHTML);
    return body.innerHTML;
  }
  
  private SendEmail(emailprops:any){
    sp.utility.sendEmail({
      //Body of Email  
      Body: this.BindHtmlBody(),
      //Subject of Email  
      Subject: emailprops.Subject,
      //Array of string for To of Email  
      To: emailprops.To,
      AdditionalHeaders: {
        "content-type": "text/html"
      },
      }).then(() => {
        console.log("Email Sent!");
      });
  }

  public render(): React.ReactElement<ICommentCardProps> {
    return (
      <div>
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Comments</h3>
          </div>

          <div className="panel-body">
           
            <div className="TopRecipients">
                <span className="mt-2 mr-5"> <strong>To:</strong></span>
                {this.topCommenters != null && this.topCommenters.length>0 && this.topCommenters.map( (topCmnt:any,i:any)=> {
                  return <span className="Recipients ng-scope">
                            <a className="hreflink" target="_blank">
                              <img onClick={(e)=>this.topCommentersClick(e)} className="Recipients-image" title={topCmnt.Title}
                                  id={topCmnt.id} src={topCmnt.ItemCoverURL}/>
                            </a>
                          </span>
                })}
                  
                
                <span className="RecipientsNameField mt-0  mb-5">
                <MentionsInput value={this.state.mentionValue} onChange={(e)=>this.setMentionValue(e)}
                      className="mentions"
                      classNames={mentionClass}>
                  <Mention trigger="@" data={this.mentionUsers} className={mentionClass.mentions__mention}/>            
                </MentionsInput>
                </span>
            </div>            
            <div className="RecipientsCommentsField ">
                <textarea id='txtComment' value={this.state.CommenttoPost} onChange={(e)=>this.handleInputChange(e)} className="form-control ui-autocomplete-input ng-valid ng-touched ng-dirty ng-empty" rows={3} placeholder="Enter your comments here" autoComplete="off" style={{width: '286px', height: '58px'}}></textarea>
                               
                <button onClick={()=>this.PostComment('txtComment')} title="Post comment" type="button" className="btn btn-primary pull-right mt-5 mb-5">
                    Post
                </button>

            </div>
            <div className="clearfix"></div>

            <div className="commentMedia">
            {this.state.Result["Comments"] != null && this.state.Result["Comments"].length>0 &&
              <div className="card">
                <ul className="list-unstyled">
                {this.state.Result["Comments"] != null && this.state.Result["Comments"].length>0 && this.state.Result["Comments"].slice(0,3).map( (cmtData:any,i:any)=> {
                  return <li className="media ng-scope">
                    <span className="round pt-2">
                      <img className="align-self-start mr-3" title={cmtData.AuthorName}
                          src={cmtData.AuthorImage != undefined && cmtData.AuthorImage != '' ? 
                          cmtData.AuthorImage  :
                            "https://hhhhteams.sharepoint.com/sites/HHHH/SiteCollectionImages/ICONS/32/icon_user.jpg"}
                            />
                    </span>
                    <div className="media-bodyy">
                      <div className="col-sm-12 pad0 d-flex">
                        <span className="comment-date pt-2 ng-binding">{cmtData.Created}</span>
                          <div className="ml-auto media-icons pt-2">
                            <a className="mr-5" onClick={()=>this.openEditModal(i)}>
                              <img src="https://hhhhteams.sharepoint.com/sites/HHHH/SiteCollectionImages/ICONS/32/edititem.gif" />
                            </a>
                            <a title="Delete" onClick={()=>this.clearComment(i)}>
                              <img src="https://hhhhteams.sharepoint.com/sites/HHHH/SiteCollectionImages/ICONS/32/delete.gif" />
                            </a>
                          </div>
                      </div>
                      <div className="col-sm-12 pad0 d-flex">
                        { cmtData.Header !='' && <h6 className="userid pt-2"><a className="ng-binding">{cmtData.Header}</a></h6>}
                      </div>
                      <p className="media-text ng-binding">{cmtData.Description}</p>
                    </div>
                  </li>
                })}
                </ul>
                {this.state.Result["Comments"] != null && this.state.Result["Comments"].length>3 &&
                  <div className="MoreComments ng-hide">
                        <a className="MoreComments ng-binding ng-hide" title="Click to Reply" onClick={()=>this.openAllCommentModal()}>
                            All Comments({this.state.Result["Comments"].length})
                        </a>
                  </div>
                }
              </div>
              }
            </div>
          </div>
        </div>
        
        <Modal isOpen={this.state.isModalOpen} isBlocking={false}>
              <div className='modal-dialog modal-help' style={{width: '890px'}}>
                <div className='modal-content'>
                  <div className='modal-header'>
                      <h3 className='modal-title'>Update Comment</h3>
                      <button type="button" className='close' style={{minWidth: "10px"}} onClick={(e) =>this.CloseModal(e) }>x</button>
                  </div>
                  <div className='modal-body'>
                  <Editor
                      toolbarClassName="toolbarClassName"
                      wrapperClassName="wrapperClassName"
                      editorClassName="editorClassName"
                      wrapperStyle={{ width: '100%', border: "2px solid black", height:'60%' }}
                  />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-primary" >Save</button>
                    <button type="button" className="btn btn-default" onClick={(e) =>this.CloseModal(e) }>Cancel</button>
                  </div>
                </div>
              </div>          
        </Modal>

        <Modal isOpen={this.state.AllCommentModal} isBlocking={false}>
          <div className='modal-dialog modal-help'>
          <div id='ShowAllCommentsId'>
            <div className='modal-content'>
                <div className='modal-header'>
                  {this.state.Result["Comments"] != undefined && this.state.Result["Comments"].length > 0 &&
                    <h3 className='modal-title'>Comment: {this.state.Result["Title"] +' ('+this.state.Result["Comments"].length +')'}</h3>
                  }  
                    <button type="button" className='close' style={{minWidth: "10px"}} onClick={(e) =>this.closeAllCommentModal(e) }>x</button>
                </div>
                <div className='modal-body bg-f5f5 clearfix'>
                <div className="col-sm-12  pl-10 boxbackcolor" id="ShowAllComments">                
                  <div className="col-sm-12 mt-10 mb-10 padL-0 PadR0">
                      <div className="col-sm-12 mb-10 pl-7 PadR0">
                        <div className="col-sm-11 padL-0">
                          <textarea id="txtCommentModal" onChange={(e)=>this.handleInputChange(e)} className="form-control ng-pristine ng-untouched ng-empty ng-invalid ng-invalid-required ui-autocomplete-input" rows={2} ng-required="true" placeholder="Enter your comments here" ng-model="Feedback.comment"></textarea>                          
                          <span role="status" aria-live="polite" className="ui-helper-hidden-accessible"></span>
                        </div>
                        <div className="col-sm-1 padL-0">
                          <div className="icon_post">
                            <img onClick={()=>this.PostComment('txtCommentModal')} title="Save changes & exit" className="ng-binding" src="https://hhhhteams.sharepoint.com/sites/HHHH/SiteCollectionImages/ICONS/32/Post.png"/>
                          </div>
                        </div>
                      </div>
                      {this.state.Result["Comments"] != null && this.state.Result["Comments"].length>0 && this.state.Result["Comments"].map( (cmtData:any,i:any)=> {
                        return <div className="DashboardpublicationItem ng-scope">
                        <div className="col-sm-12 pad7">
                          <div className="col-sm-1 padL-0 PadR0">
                            <img style={{height:'35px',width:'35px'}} title={cmtData.AuthorName} 
                              src={cmtData.AuthorImage != undefined && cmtData.AuthorImage != '' ? 
                              cmtData.AuthorImage  :
                                "https://hhhhteams.sharepoint.com/sites/HHHH/SiteCollectionImages/ICONS/32/icon_user.jpg"}
                              />                            
                          </div>
                          <div className="col-sm-11 padL-0 PadR0">
                            <div className="" style={{color:'#069'}}>                              
                              <span className="footerUsercolor ng-binding" style={{fontSize: 'smaller'}}>{cmtData.Created}</span>
                              <a className="hreflink" onClick={()=>this.openEditModal(i)}>
                                <img src="https://hhhhteams.sharepoint.com/sites/HHHH/SiteCollectionImages/ICONS/32/edititem.gif" />
                              </a>
                              <a className="hreflink" title="Delete" onClick={()=>this.clearComment(i)}>
                                <img src="https://hhhhteams.sharepoint.com/sites/HHHH/SiteCollectionImages/ICONS/32/delete.gif" />
                              </a>
                            </div>
                            {cmtData.Header !='' && <b className="ng-binding">{cmtData.Header}</b>}
                          </div>
                          <div className="col-sm-1"></div>
                          <div className="col-sm-11 padL-0">
                            <span id="pageContent" className="ng-binding">{cmtData.Description}</span>
                          </div>
                        </div>
                      </div>
                      })}
                      
                  </div>          

                </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary" >Save</button>
                  <button type="button" className="btn btn-default" onClick={(e) =>this.closeAllCommentModal(e) }>Cancel</button>
                </div>
            </div>
          </div>          
          </div>          
        </Modal>

        {this.state.Result !=null && this.state.Result["Comments"] != null && this.state.Result["Comments"].length > 0 &&
        <div id='htmlMailBody' style={{display:'none'}}>
        <p><a><span>{this.state.Result["Title"]}</span></a></p>
        <table>
          <tr>
            <td>
              {/* table for Comments */}
              <table style={{border:'1px solid black'}}>
                <tr>
                  <td colSpan={2}>Comments ({this.state.Result["Comments"].length})</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                </tr>
                {this.state.Result["Comments"].map( (cmtData:any,i:any)=> {
                  return  <tr>
                          <td><span>{cmtData.Description}</span></td>
                          <td><span>{cmtData.Created}</span></td>
                          </tr>
                })}
                
              </table>
            </td>
            <td>
              {/* table for Basid info */}
              <table style={{border:'1px solid black'}}>
                <tr>
                  <td>
                    <table>
                      <tr>
                        <td colSpan={5}>
                        Task Details
                        </td>
                      </tr>
                      <tr><td colSpan={5}></td></tr>
                      <tr>
                        <td>Task URL:</td>
                        <td colSpan={4}>{this.state.Result["component_url"] != null ? this.state.Result["component_url"].Url : ''}</td>
                      </tr>
                      <tr><td colSpan={5}></td></tr>
                      <tr>
                        <td>Component:</td>
                        <td></td>
                        <td></td>
                        <td>Team:</td>
                        <td></td>
                      </tr>
                      <tr><td colSpan={5}></td></tr>
                    </table>
                    <table>
                      <tr>
                        <td>Status:</td>
                        <td></td>
                        <td>Priority:</td>
                        <td></td>
                        <td>Created By:</td>
                        <td></td>
                        <td>Modified By:</td>
                      </tr>
                      <tr>
                        <td>{this.state.Result["CompletedDate"]} {this.state.Result["Status"]}</td>
                        <td></td>
                        <td>{this.state.Result["Priority"]}</td>
                        <td></td>
                        <td>{this.state.Result["Author"] != null && this.state.Result["Author"].length > 0 && this.state.Result["Author"][0].Title}</td>
                        <td></td>
                        <td>{this.state.Result["ModifiedBy"] != null && this.state.Result["ModifiedBy"].length > 0 && this.state.Result["ModifiedBy"][0].Title}</td>
                      </tr>
                      <tr>
                        <td colSpan={7}></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table style={{border:'1px solid black'}}>
          <tr>
            <td>
              <table>
                <tr>
                  <td colSpan={3}>Task Description : </td>
                </tr>
                <tr>
                  <td></td>
                </tr>                
                {this.state.Result["SharewebTaskType"] !=null && this.state.Result["SharewebTaskType"] !='' && 
                    this.state.Result["SharewebTaskType"] == 'Task' && this.state.Result["FeedBack"] != null && 
                    this.state.Result["FeedBack"][0].FeedBackDescriptions.length > 0 && 
                    this.state.Result["FeedBack"][0].FeedBackDescriptions[0].Title!='' &&
                    this.state.Result["FeedBack"][0].FeedBackDescriptions.map( (fbData:any,i:any)=> {
                      return <table>
                                  <tr>
                                    <td>{i+1}.</td>
                                    <td>{fbData['Title'].replace(/<[^>]*>/g, '')}</td>
                                  </tr>
                        {fbData['Subtext'] != null && fbData['Subtext'].length > 0 && fbData['Subtext'].map( (fbSubData:any,j:any)=> {
                          return <tr>
                            <td>{i+1}.{j+1}</td>
                            <td>{fbSubData['Title'].replace(/<[^>]*>/g, '')}</td>
                          </tr>
                        })}
                      </table>                      
                    })}               
                
              </table>
            </td>
          </tr>
        </table>
      </div>
        }
        

      </div>      
    );
  }
}

export default CommentCard;