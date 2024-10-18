import "./Tile.css";

interface Props{
    num: number;
    id: string;
    image: string;
}

export default function Tile({num, id, image}: Props) {


     if(num%2==0){
        return(<div className='tile black-tile' id={id} >
            {image !== ''? <div style={{backgroundImage: `url("../../images/${image}.png")`}} className='chess-piece' id={id}></div> : <></>}
        </div>)
    }if(num%2==1){
        return(<div className='tile white-tile' id={id} >
            {image !== ''? <div style={{backgroundImage: `url("../../images/${image}.png")`}} className='chess-piece' id={id}></div> : <></>}
        </div>)
    }

}

