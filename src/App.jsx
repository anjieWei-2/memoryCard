import { useState, useEffect } from 'react'
import './App.css'
import Confetti from 'react-confetti'

function App() {
  const [currentScore, setCurrentScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [cardData, setCardData] = useState()
  const [randomAgain, setRandomAgain] = useState(false)
  useEffect(() => {
    let randomIDs = []
    for (let i =0,  j =0; i<20;){
      let randomNum = Math.floor(Math.random()*898)+1
      if (!randomIDs.includes(randomNum)){
          randomIDs.push(randomNum)
          i++
      }
      j++
      if (j==100){
        break
      }
    }
    const fetchData = async()=>{
      try{
        if (randomIDs.length === 0) {
          return; 
        }
        const requests = randomIDs.map(async (id) =>{
          const response = await fetch (`https://pokeapi.co/api/v2/pokemon/${id}`)
          const data = await response.json()
          const name = data.species.name
          const img = data.sprites.front_default
          return {id, name, img}
        })
        const pokemons = await Promise.all(requests)
        setCardData(pokemons)
      }catch (error){
        console.error('Fetch error: ', error)
      }
    }
    if (randomIDs.length>0){
      fetchData()
    }
  },[randomAgain])

  function shuffleArray(array){
    const shuffledArray = [...array]
    for (let i = shuffledArray.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1))
      let temp = shuffledArray[i]
      shuffledArray[i] = shuffledArray[j]
      shuffledArray[j] = temp
    }
    return shuffledArray
  }

  const [clickedCards, setClickedCards] = useState([])
  const [flipCards, setFlipCards] = useState(false)
  const [fail, setFail] = useState(false)
  const [win, setWin] = useState(false)
  const clickCard = (id)=>{
    if (clickedCards.includes(id)){
      setFail(true)
      if (currentScore>bestScore){
        setBestScore(currentScore)
      }
      setCurrentScore(0)
      setClickedCards([])
    }else{
      setFail(false)
      setClickedCards((prev)=>[...prev, id])
      setCurrentScore((currentScore)=>currentScore+1)

      setFlipCards(true)
      setTimeout(() => {
        const shuffledArray = shuffleArray(Object.values(cardData))
        setCardData(shuffledArray)
        setFlipCards(false);
      }, 500);

      if((currentScore+1)==20){
        setWin(true)
        if (bestScore<20){
          setBestScore(20)
        }
        setCurrentScore(0)
        setClickedCards([])      
      }
    }
  }
  

  return (
    <>
      <div className="scoreboard">
        <p>Current Score: {currentScore}</p>
        <p>Best Score: {bestScore}</p>
      </div>
      <h1>Click the card you haven't clicked so far!</h1>
      <div className={`popUp ${fail?'':'notShow'}`}>
        <button onClick={()=>setFail(false)} className='closePopUp'>x</button>
        <h1>Oops, you lose!</h1>
        <p>Maybe try a different set of pokemons?</p>
        <button onClick={()=>{
          setFail(false)
          setRandomAgain(!randomAgain)}}>Yes
        </button>
        <button onClick={()=>setFail(false)}>No</button>
      </div>

      <div className={`popUp win ${win?'':'notShow'}`}>
        <button onClick={()=>setWin(false)} className='closePopUp'>x</button>
        <h1>Congratulations! You Win!</h1>
        <p>Maybe try a different set of pokemons?</p>
        <button onClick={()=>{
          setWin(false)
          setRandomAgain(!randomAgain)}}>Yes
        </button>
        <button onClick={()=>setWin(false)}>No</button>
        <Confetti width={window.width} height={window.height} />
      </div>

      <div className={`playground ${flipCards?'flipCards':''}`}>
        {cardData && cardData.length > 0 && cardData.map((card)=>(
          <div className="card" key={card.id} onClick={()=>{clickCard(card.id)}}>
            <img src={card.img} alt={card.name} id={card.id} />
            <p>{card.name}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export default App
