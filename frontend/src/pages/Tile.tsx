import "./Tile.css";
import resources from "./consts.ts";


interface Props{
    num: number;
    id: string;
    image: string;
}

export default function Tile({num, id, image}: Props) {
    const {images} = resources;


    if(num%2==0){
        return(<div className='tile black-tile' id={id} >
            {image !== ''? <div style={{backgroundImage: `url(${images.get(image)})`}} className='chess-piece' id={id} key={image}></div> : <></>}
        </div>)
    }if(num%2==1){
        return(<div className='tile white-tile' id={id} >
            {image !== ''? <div style={{backgroundImage: `url(${images.get(image)})`}} className='chess-piece' id={id} key={image}></div> : <></>}
        </div>)
    }

}

