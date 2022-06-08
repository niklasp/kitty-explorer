import Head from 'next/head'
import { filter } from "lodash";
import { useState, useEffect } from 'react';
import KittyGrid from '../components/kitty-grid';
import KittyInfo from '../components/kitty-info';
import KittySettings from '../components/kitty-settings';

import { getKitties, getKittiesSorted } from '../lib/kitties'

// import prisma from '../lib/prisma';

export async function getStaticProps() {
  const { data, forSaleCount, floorKitties } = await getKitties();

  return {
    props: {
      allKitties: data,
      forSaleCount,
      floorKitties,
      totalCount: Object.keys(data).length,
    },
    revalidate: 60 * 60 * 2, // In seconds = every 2 hours
  }
}

export default function Home( { allKitties, forSaleCount, totalCount, floorKitties } ) {
  const [ isInfoHidden, setInfoHidden ] = useState(true);
  const [ shownKitties, setShownKitties ] = useState( allKitties );
  const [ sort, setSort ] = useState( {
    sortBy: 'id',
    sortDir: 'desc',
  } );
  const [ kittyFilter, setKittyFilter ] = useState( 'all' );

  useEffect( async () => {
    let sortedKitties = getKittiesSorted( allKitties, sort.sortBy, sort.sortDir );
    if ( kittyFilter === 'forsale' ) {
      sortedKitties = filter( sortedKitties, ( o ) => parseInt(o.forsale) !== 0 );
    }
    setShownKitties( sortedKitties );
  }, [ kittyFilter, sort ] )

  allKitties.map( ( kit ) => {
    let meta = {};
    try {
      meta = JSON.parse( kit.metadata )
    } catch( e ) {

    }

    return {
      ...kit,
      metadata: meta,
    }
  });

  // console.log( 'received from db:', feed );

  function handleInfoClick() {
    setInfoHidden( !isInfoHidden )
  }

  const onFilterClick = value => () => {
    setKittyFilter( value );
  }

  const onSortClick = value => () => {
    setSort( value );
  }

  return (
    <div className="container">
      <Head>
        <title>Kitty Paradise Explorer — 500 Kusama pixel art NFTs</title>
        <meta name="title" content="Kitty Paradise Explorer — 500 Kusama pixel art NFTs" />
        <meta name="description" content="Showcases all unique Kitty Paradise NFTs with options to buy or just look around. Made by Yumi, living on Kusama / Polkadot. Get yours now!" />

        <meta name="keywords" content="Kusama, NFT, Polkadot" />
        <meta name="author" content="Niklas P" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://metatags.io/" />
        <meta property="og:title" content="Kitty Paradise Explorer — 500 Kusama pixel art NFTs" />
        <meta property="og:description" content="Showcases all unique Kitty Paradise NFTs with options to buy or just look around. Made by Yumi, living on Kusama / Polkadot. Get yours now!" />
        <meta property="og:image" content="https://kitty-explorer.vercel.app/kitty-explorer.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://metatags.io/" />
        <meta property="twitter:title" content="Kitty Paradise Explorer — 500 Kusama pixel art NFTs" />
        <meta property="twitter:description" content="Showcases all unique Kitty Paradise NFTs with options to buy or just look around. Made by Yumi, living on Kusama / Polkadot. Get yours now!" />
        <meta property="twitter:image" content="https://kitty-explorer.vercel.app/kitty-explorer.png" />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <KittyGrid allKitties={ shownKitties } />
        <button className="btn-about" onClick={ () => setInfoHidden( !isInfoHidden ) }>
          about
        </button>
        <KittySettings
          sort={ sort }
          filter={ kittyFilter }
          onFilterClick={ onFilterClick }
          onSortClick={ onSortClick }
        />
        <KittyInfo
          forSaleCount={ forSaleCount }
          totalCount={ totalCount }
          hidden={ isInfoHidden }
          handleClick={ handleInfoClick }
          floorKitties={ floorKitties }
        />
      </main>
    </div>
  )
}
