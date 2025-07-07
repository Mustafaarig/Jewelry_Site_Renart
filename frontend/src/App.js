import React, { useEffect, useState } from 'react';
import './App.css';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

<header className="site-header">
  <img src="/images/Renart_Social_Primary.png" alt="Renart Logo" className="logo" />
</header>
// Ok Bileşenleri
const NextArrow = ({ className, onClick }) => (
  <div className={className + " custom-arrow"} onClick={onClick} style={{ right: "-10px", zIndex: 1 }}>
    ➤
  </div>
);

const PrevArrow = ({ className, onClick }) => (
  <div className={className + " custom-arrow"} onClick={onClick} style={{ left: "-10px", zIndex: 1 }}>
    ◀
  </div>
);

function App() {
  const [products, setProducts] = useState([]);
  const [goldPrice, setGoldPrice] = useState(0);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minScore, setMinScore] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
  fetch('https://renart-backend-w3x5.onrender.com/products')
    .then(res => {
      if (!res.ok) {
        throw new Error(`Sunucu hatası: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log("Gelen veri:", data);
      if (Array.isArray(data.products)) {
        const initialized = data.products.map(p => ({
          ...p,
          voteCount: 1,
          totalScore: p.popularityScore,
          currentScore: p.popularityScore,
          calculatedPrice: ((p.popularityScore + 1) * p.weight * data.goldPrice).toFixed(2)
        }));
        setProducts(initialized);
        setFiltered(initialized);
        setGoldPrice(data.goldPrice || 0);
      }
    })
    .catch(err => {
      console.error("API Hatası:", err);
    });
}, []);


  const applyFilter = () => {
    const minP = parseFloat(minPrice) || 0;
    const maxP = parseFloat(maxPrice) || Infinity;
    const minS = parseFloat(minScore) || 0;

    const result = products.filter(p =>
      parseFloat(p.calculatedPrice) >= minP &&
      parseFloat(p.calculatedPrice) <= maxP &&
      parseFloat(p.currentScore * 5) >= minS
    );
    setFiltered(result);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } }
    ]
  };

  const handleVote = (index, score) => {
    const updated = [...products];
    const p = updated[index];
    p.totalScore += score;
    p.voteCount += 1;
    p.currentScore = +(p.totalScore / p.voteCount).toFixed(2);
    p.calculatedPrice = ((p.currentScore + 1) * p.weight * goldPrice).toFixed(2);
    setProducts(updated);
    applyFilter(); // filtre yeniden uygulanmalı
  };

  return (
    <div className="App">
      <div className="header-banner">
      <img src="/images/renartglobal_cover.jfif" alt="Renart Cover" className="header-image" />
       </div>
      <h1 className="product-title">Product List</h1>
      <p style={{ fontFamily: 'MontserratMedium', marginBottom: '20px' }}>
        Gold Price: ${goldPrice}
      </p>
      
      <header className="site-header">
      <img src="/images/Renart_Social_Primary.png" alt="Renart Logo" className="logo" />
      </header>
      <div className="filter-area">
        <input type="number" placeholder="Min Price" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
        <input type="number" placeholder="Max Price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        <input type="number" placeholder="Min Score (1-5)" value={minScore} onChange={e => setMinScore(e.target.value)} />
        <button onClick={applyFilter}>Filter</button>
      </div>

      {filtered.length > 2 ? (
  <Slider {...sliderSettings}>
    {filtered.map((product, i) => (
      <ProductCard key={i} product={product} index={i} handleVote={handleVote} />
    ))}
  </Slider>
) : (
  <div className="product-grid">
    {filtered.map((product, i) => (
      <ProductCard key={i} product={product} index={i} handleVote={handleVote} />
    ))}
  </div>
)}
    </div>
  );
}

function ProductCard({ product, index, handleVote }) {
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [userRating, setUserRating] = useState(0);

  const colors = {
    yellow: "#E6CA97",
    white: "#D9D9D9",
    rose: "#E1A4A9"
  };

  const vote = (score) => {
    setUserRating(score);
    handleVote(index, score);
  };

  return (
    <div className="product-card">
      <img src={product.images[selectedColor]} alt={product.name} className="product-image" />
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">${product.calculatedPrice} USD</p>

      <div className="colors">
        {Object.entries(colors).map(([color, hex]) => (
          <button
            key={color}
            style={{
              backgroundColor: hex,
              border: selectedColor === color ? "2px solid black" : "1px solid gray",
              borderRadius: "50%",
              width: 20,
              height: 20,
              margin: 5,
              cursor: "pointer"
            }}
            onClick={() => setSelectedColor(color)}
            title={color}
          />
        ))}
      </div>

      <p className="color-label">
        {selectedColor === "yellow" ? "Yellow Gold" : selectedColor === "white" ? "White Gold" : "Rose Gold"}
      </p>

      <div className="product-rating">
        <span className="stars">
          {[1, 2, 3, 4, 5].map(i => (
            <span
              key={i}
              onClick={() => vote(i)}
              style={{ cursor: "pointer", color: i <= userRating ? "#f1c40f" : "#ccc", fontSize: "18px" }}
            >
              ★
            </span>
          ))}
        </span>
        <span style={{ marginLeft: '6px' }}>({(product.currentScore).toFixed(2)}/5)</span>
      </div>
    </div>
  );
}

export default App;
