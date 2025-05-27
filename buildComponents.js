import React from 'react';
import './css/buildComponents.css';

//komponenty použité pro generování grafických prvků
export class TableSquare extends React.Component{        //komponenta, která generuje buňky s vnitřní hodnotou
    render(){
        return (
            <div className={this.props.className}> {this.props.value}</div>
          );
    }
  }
  
  export class SelectionButton extends React.Component {  
    render(){
        return (
        <div className="selectionButton">
          <button className="btn btn-Tab" onClick={this.props.onClick}>
            {this.props.value}
          </button>
        </div>
      );
    }
  }

  export class Square extends React.Component {
       render(){
        return (
            <div className="mapSquare" onClick={this.props.onClick}>
              <button className="btnMap">
                {this.props.value}
                <div className="" id={this.props.idPrefix + this.props.i + this.props.j}></div>
              </button>
            </div>
          );
       } 
    }