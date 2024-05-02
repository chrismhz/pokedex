import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import PokemonCard from "./PokemonCard";
import DatosPokemon from "./DatosPokemon";

const Pokedex = () => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [initialPokemonIds, setInitialPokemonIds] = useState([]);

  useEffect(() => {
    const fetchInitialPokemons = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon/?offset=0&limit=20");
        const data = await response.json();
        const initialPokemons = await Promise.all(
          data.results.map(async (pokemon) => {
            const detailsResponse = await fetch(pokemon.url);
            return await detailsResponse.json();
          })
        );
        setPokemons(initialPokemons);
        setInitialPokemonIds(initialPokemons.map(pokemon => pokemon.id));
      } catch (error) {
        Swal.fire("Error", "No se pudo conectar al API", "error");
        console.error(error);
      }
      setLoading(false);
    };

    fetchInitialPokemons();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (offset !== 0) {
        setLoading(true);
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=20`);
          const data = await response.json();
          const newPokemons = await Promise.all(
            data.results.map(async (pokemon) => {
              const detailsResponse = await fetch(pokemon.url);
              return await detailsResponse.json();
            })
          );
          const filteredNewPokemons = newPokemons.filter(newPokemon => !initialPokemonIds.includes(newPokemon.id));
          setPokemons((prevPokemons) => [...prevPokemons, ...filteredNewPokemons]);
        } catch (error) {
          Swal.fire("Error", "No se pudo conectar al API", "error");
          console.error(error);
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [offset, initialPokemonIds]);

  const handleScroll = () => {
    const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight;
    if (bottom && !loading) {
      setOffset((prevOffset) => prevOffset + 20);
    }
  };

  const debouncedHandleScroll = debounce(handleScroll, 200); // Debounce handleScroll function

  useEffect(() => {
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [debouncedHandleScroll]);

  const handlePokemonSelect = (pokemon) => {
    setSelectedPokemon(pokemon);
  };

  return (
    <section className="col-sm-12 col-lg-8 d-flex justify-content-center flex-wrap z-1 mt-5">
      {pokemons.map((pokemon, index) => (
        <PokemonCard key={index} pokemon={pokemon} onSelect={handlePokemonSelect} />
      ))}
      {loading && <p>Loading...</p>}
      {selectedPokemon && <DatosPokemon pokemon={selectedPokemon} />}
    </section>
  );
};

export default Pokedex;

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}