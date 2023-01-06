import * as React from "react";
import * as $ from 'jquery';
//import '../../webparts/taskDashboard/components/foundation.scss';
import { arraysEqual, Modal } from 'office-ui-fabric-react';
import "bootstrap/dist/css/bootstrap.min.css";
import '../../webparts/cssFolder/Style.scss';
//import '../../webparts/taskDashboard/components/TaskDashboard.scss';
const Picker=(item:any)=>{
    const [PopupSmartTaxanomy, setPopupSmartTaxanomy] = React.useState(false);
    const [AllCategories, setAllCategories] = React.useState([]);
    const [select, setSelect] = React.useState([]);

    const openPopupSmartTaxanomy = () => {
        setPopupSmartTaxanomy(true)

    }
    React.useEffect(()=>{
        loadGmBHTaskUsers();
    },[])
    const closePopupSmartTaxanomy = () => {
        //Example(item);
        setPopupSmartTaxanomy(false)

    }
    const saveCategories=()=>{
        item.props.categories = [];
        item.props.smartCategories = [];
        var title:any ={}
        title.Title =select;
        item.props.smartCategories.push(title);
        item.props.categories = select;
        Example(item);

    }
    var SmartTaxonomyName = "Categories";
    const loadGmBHTaskUsers = function () {
        var AllTaskusers = []
        var AllMetaData: any = []
        var TaxonomyItems:any=[]
        var url = ("https://hhhhteams.sharepoint.com/sites/HHHH/sp/_api/web/lists/getbyid('01a34938-8c7e-4ea6-a003-cee649e8c67a')/items?$select=Id,Title,IsVisible,ParentID,SmartSuggestions,TaxType,Description1,Item_x005F_x0020_Cover,listId,siteName,siteUrl,SortOrder,SmartFilters,Selectable,IsSendAttentionEmail/Id,IsSendAttentionEmail/Title,IsSendAttentionEmail/EMail&$expand=IsSendAttentionEmail&$orderby=SortOrder&$top=4999&$filter=TaxType eq '" + SmartTaxonomyName + "'")
        $.ajax({

            url: url,

            method: "GET",

            headers: {

                "Accept": "application/json; odata=verbose"

            },
            success: function (data) {
                AllTaskusers = data.d.results;
                $.each(AllTaskusers, function (index:any,item:any) {
                    if (item.Title.toLowerCase() == 'pse' && item.TaxType == 'Client Category') {
                        item.newTitle = 'EPS';
                    }
                    else if (item.Title.toLowerCase() == 'e+i' && item.TaxType == 'Client Category') {
                        item.newTitle = 'EI';
                    }
                    else if (item.Title.toLowerCase() == 'education' && item.TaxType == 'Client Category') {
                        item.newTitle = 'Education';
                    }
                    else {
                        item.newTitle = item.Title;
                    }
                    AllMetaData.push(item);
                })
                TaxonomyItems = loadSmartTaxonomyPortfolioPopup(AllMetaData);
                setAllCategories(TaxonomyItems)
                setPopupSmartTaxanomy(true)

            },
            error: function (error) {


            }
        })
    };
    var loadSmartTaxonomyPortfolioPopup =(AllTaxonomyItems:any)=> {
        var TaxonomyItems:any = [];
        var uniqueNames:any = [];
        $.each(AllTaxonomyItems, function (index:any,item:any) {
            if (item.ParentID == 0 && SmartTaxonomyName == item.TaxType) {
                TaxonomyItems.push(item);
                getChilds(item, AllTaxonomyItems);
                if (item.childs != undefined && item.childs.length > 0) {
                    TaxonomyItems.push(item)
                }
                 uniqueNames = TaxonomyItems.filter((val:any, id:any, array:any) => {
                    return array.indexOf(val) == id;  
                 });
              
            } 
        });
        return uniqueNames;
    }
   
    const getChilds =(item:any, items:any)=> {
        item.childs = [];
        $.each(items, function (index:any,childItem:any) {
            if (childItem.ParentID != undefined && parseInt(childItem.ParentID) == item.ID) {
                childItem.isChild = true;
                item.childs.push(childItem);
                getChilds(childItem, items);
            }
        });
    }
    var isItemExists =(items:any, columnName:any)=> {
        var flag = false;
        $.each(items, function (index:any,item:any) {
            if (item.Id == columnName)
                flag = true;
        });
        return flag;
    }
    const selectPickerData=(item:any)=>{
    setSelect(item)
    //Example(item);
    
    }
    function Example(callBack: any) {

        item.Call(callBack.props);

    }
    const setModalIsOpenToFalse = () => {
      
        setPopupSmartTaxanomy(false)
    }
    return(
        <>
        
                                                                                      
        <Modal
                isOpen={PopupSmartTaxanomy}
                onDismiss={closePopupSmartTaxanomy}
                isBlocking={false}

            >

                <div id="SmartTaxonomyPopup">
                    <div className="modal-dailog modal-lg">
                        <div className="panel panel-default" ng-cloak>
                            <div className="modal-header">
                                <h3 className="modal-title">
                                Select Categories 
                                </h3>
                                <button type="button" style={{ minWidth: "10px" }} className="close" data-dismiss="modal"
                                    onClick={closePopupSmartTaxanomy}>
                                    &times;
                                </button>
                            </div>
                            <div className="modal-body clearfix bg-f5f5">
                            <div className="col-sm-12 ActivityBox" ng-show="SmartTaxonomyName==newsmarttaxnomy">
                    <span ng-show="item.Title!=undefined &&MainItem.CompositionSiteType=='EI'&&item.SiteType!=undefined &&item.SiteType=='EI'" className="block clear-assessment mr-4"
                         >
                        {select}<a className="hreflink"
                                         ng-click="removeSmartArray(item.Id)"> <img src="https://hhhhteams.sharepoint.com/sites/HHHH/SP/_layouts/images/delete.gif"/></a>
                    </span>
                    
                </div>
                            <table className="ms-dialogHeaderDescription">
                                        <tbody>
                                            <tr id="addNewTermDescription" className="">
                                                <td>New items are added under the currently selected item.</td>
                                                <td className="TaggingLinkWidth">
                                                    <a className="hreflink" ng-click="gotomanagetaxonomy();">
                                                        Add New Item
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr id="SendFeedbackTr">
                                                <td>Make a request or send feedback to the Term Set manager.</td>
                                                <td className="TaggingLinkWidth">
                                                    <a ng-click="sendFeedback();">
                                                        Send Feedback
                                                    </a>
                                                </td>
                                                <td className="TaggingLinkWidth">
                                                    {select}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className="col-sm-12 padL-0 PadR0 divPanelBody">
                    <nav id="nav_pop-up">
                        <ul id="main-menu" style={{display:"grid"}}>
                            {AllCategories.map(function(item:any){
                                return(
                              <>
                             
                            <li>
                               
                             {item.Item_x005F_x0020_Cover != null &&
                               <a className="hreflink" ng-click="selectnewItem(item);" onClick={()=>selectPickerData(item.Title)}>
                                    <img className="flag_icon"
                                         style={{height: "12px", width:"18px"}} src={item.Item_x005F_x0020_Cover.Url}/>
                                    {item.Title}
                                    </a>
                            }   
                             

                              
                                <ul ng-if="item.childs.length>0" className="sub-menu clr mar0">
                                {item.childs.map(function(child1:any){
                                return(
                              <>
                                    <li>
                                      
                                            {child1.Item_x005F_x0020_Cover != null &&
                                              <a className="hreflink" ng-click="selectnewItem(child1);"onClick={()=>selectPickerData(child1.Title)}>
                                            <img ng-if="child1.Item_x005F_x0020_Cover!=undefined" className="flag_icon"
                                                 style={{height: "12px", width:"18px;"}}
                                                 src={child1.Item_x005F_x0020_Cover.Url}/> {child1.Title} <span ng-show="child1.Description1 != null" className="project-tool top-assign">
                                                <img ng-src="{{baseUrl}}/SiteCollectionImages/ICONS/24/infoIcon.png" />
                                                <span className="tooltipte">
                                                    <span className="tooltiptext">
                                                        <div className="tooltip_Desc">
                                                            <span ng-bind-html="child1.Description1 | trustedHTML">{child1.Description1}</span>
                                                        </div>
                                                    </span>
                                                </span>
                                            </span>
                                            </a>
                                }
                                        
                                        {/* <ul ng-if="child1.childs.length>0" className="sub-menu clr2 mar0 padL-0">
                                            <li ng-repeat="child2 in child1.childs|orderBy:'Title'">
                                                <a className="hreflink" ng-click="selectnewItem(child2);">
                                                    <img ng-if="child2.Item_x005F_x0020_Cover!=undefined"
                                                         class="flag_icon" style="height: 12px; width:18px;"
                                                         ng-src="{{child2.Item_x005F_x0020_Cover.Url}}"> {{child2.Title}}
                                                    <span ng-show="child2.Description1 != null"
                                                          className="project-tool top-assign">
                                                        <img ng-src="{{baseUrl}}/SiteCollectionImages/ICONS/24/infoIcon.png" />
                                                        <span className="tooltipte">
                                                            <span className="tooltiptext">
                                                                <div className="tooltip_Desc">
                                                                    <span ng-bind-html="child2.Description1  | trustedHTML"></span>
                                                                </div>
                                                            </span>
                                                        </span>
                                                    </span>
                                                </a>
                                                <ul ng-if="child2.childs.length>0" className="sub-menu clr2 mar0 padL-0">
                                                    <li ng-repeat="child3 in child2.childs|orderBy:'Title'">
                                                        <a className="hreflink" ng-click="selectnewItem(child3);">
                                                            <img ng-if="child3.Item_x005F_x0020_Cover!=undefined"
                                                                 class="flag_icon" style="height: 12px; width:18px;"
                                                                 ng-src="{{child3.Item_x005F_x0020_Cover.Url}}"> {{child3.Title}}
                                                            <span ng-show="child3.Description1 != null"
                                                                  className="project-tool top-assign">
                                                                <img ng-src="{{baseUrl}}/SiteCollectionImages/ICONS/24/infoIcon.png" />
                                                                <span className="tooltipte">
                                                                    <span className="tooltiptext">
                                                                        <div className="tooltip_Desc">
                                                                            <span ng-bind-html="child3.Description1  | trustedHTML"></span>
                                                                        </div>
                                                                    </span>
                                                                </span>
                                                            </span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </li>
                                        </ul> */}
                                    </li>
                                    </>
                            )
                            })}
                                </ul>
                            </li>
                            </>
                            )
                            })}
                        </ul>
                    </nav>
                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={saveCategories}>
                                    OK
                                </button>

                            </div>




                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}
export default Picker;