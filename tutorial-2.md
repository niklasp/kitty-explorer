Kitty Part 1

You are reading part 2/3 on how to create a nifty front-end for your favorite NFT collection on singular.app using the latest web frameworks with advanced caching mechanisms.

[Part 1](https://app.subsocial.network/6904/coding-a-rmrk-nft-explorer-with-nextjs-part-1-33590) covered the project setup and an introduction to the UI and the UX. The data the app used was provided from a static json file in the repository, that was manually saved.

# In part 2 you will learn

- how to query an API to retrieve RMRK2 data regularly
- to filter and sort the kitty data efficiently
- to write a react filtering + sorting component

You will need 30-60min depending on your knowledge to follow along

# Prerequisites + Setting Up
Basic understanding of
- react
- javascript
- css
- html
- git

If you have not already, clone the directory, or pull the latest changes, then checkout the `part2` branch, it includes all the code needed here so you can follow along easily. If you want no code and write / copy everything yourself, checkout the `part1-complete` branch and go from there.
```
git pull
# or git clone git@github.com:niklasp/kitty-explorer.git
git checkout part2
```
>*As a task you can always try with a different collection and maybe change the styling that it fits the new collection.*
# Getting dynamic data from an API

For serverless applications in next.js we sometimes will not have a database backend. We could have it but it is an extra step of coding not needed for this part of the tutorial.

> In part 3 we will eventuall make use of a database though to store data and especially to react to new blocks and changes to the NFTs we want to monitor

That said, one great data source modern frontend apps rely on are APIs. And luckily there is a [community-created open source API by Matthew Darnell](https://github.com/MatthewDarnell/rmrk2-template-boilerplate) that offers all we need at the moment:

- query RMRK collections
- query single RMRK NFTs

You can investigate the API endpoints here

```
http://138.68.123.124/api
```

We will use `/get_nfts_by_collection/:collection` where `:collection` is the collection id we can e.g. find on the singular marketplace in the browser adress bar:

[image]

So the final endpoint we want to query is

Currently the data source logic is in `lib/kitties.js`, where currently the dumped json file is read. Go ahead and add the following directly under the `getKitties` function definition:

```js
  const response = await fetch("http://138.68.123.124/get_nfts_by_collection/800f8a914281765a7d-KITTY" );
  const jsonData = await response.json();
```
Also make sure to remove the `import jsonData from './kitties.json';` at the beginning of the file.

We are waiting for the response of the asynchronous [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) and then calling the `json`-Method on the result.

> The Response object, in turn, does not directly contain the actual JSON response body but is instead a representation of the entire HTTP response. So, to extract the JSON body content from the Response object, we use the json() method, which returns a second promise that resolves with the result of parsing the response body text as JSON.

> *https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch*

Go ahead and test your frontend with `npm run dev` and watch the results.

[image]

It should look something like the above image but probably with more kitties as [@Yumi](https://twitter.com/YumiArtsNFT) probably updated the collection already since this tutorial was written.

## Some words on API usage

The provided API is self hosted and there is a query limit of 20 queries per minute. That is very well understandable as the hosting and providing of the service costs money. There are usually free plans on heroku or other hosting services but if requests scale, so will the costs.

For NFTs, blockchain indexing will also require fetching lots of data from IPFS services. While a very trimmed down version of the nft metadata is stored onchain, many metadata is hidden behind another ipfs query for the full nft metadata (e.g.full history: sales, listings) as json.

Please keep that in mind when writing your applications and do not query too often, we will show below how we only query the API every 4 hours with next build in [SSG revalidation](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration).

Nextjs offers a handy way of polling services in a frequency you can define. We are using the `getStaticProps` function on our main page. It is called at build time on the server side, if however you also supply the [`revalidate`](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration) property, the function will be called again if the specified time passed and a new request comes in. 

In `pages/index.js` make `getStaticProps` return the following, so that it now calls the function again every 4 hours.

```js
  return {
    props: {
      allKitties: kitties,
    },
    revalidate: 60 * 60 * 4, //in seconds
  }
```

> *Singular is also working on a API and eventually RMRK pallets will most probably make it obsolete because - as far as I understood - the polkadot API can then directly be queried very conveniently. KodaDot also offers a free graphql endpoint to query dotsama NFTs but currently they only support RMRK1.*

[image api]

# Sorting and Filtering

The frontend looks nice already, but what is missing are functions to filter and/or sort the collection. As a user we would usually be interested in showing only kitties that are currently for sale or show the cheapest kitties first. So let's build that.

## The functionality

Add the following code in `pages/index.js` directly below `export default function Home( { allKitties } ) {`

First we will introduce 3 state variables:
```js
  // the filtered and sorted kitties
  const [ shownKitties, setShownKitties ] = useState( [] );
  // the key to sort for and the direction (descending / ascending)
  const [ sort, setSort ] = useState( {
    sortBy: 'forsale',
    sortDir: 'asc',
  } );
  // a key to filter the kitties for ('all' or 'forsale')
  const [ kittyFilter, setKittyFilter ] = useState( 'forsale' );
```

Then we write one [`useEffect`-function](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects) that will update the `shownKitties` array with the filtered and sorted data, each time either `sort` or `kittyFilter` change.

```js
  useEffect( () => {
    let filteredKitties = allKitties;
    if ( kittyFilter !== 'all' ) {
      filteredKitties = allKitties.filter(
        ( kit ) => parseInt( kit.forsale ) !== 0
      );
    }
    setShownKitties(
      getKittiesSorted( filteredKitties, sort.sortBy, sort.sortDir )
    );
    console.log( 'shownkitties', shownKitties );
  }, [ kittyFilter, sort ] );
```
We do not directly want to transform the passed prop `allKitties` but rather keep responsibilites clean and separate by altering the `shownKitties` state variable.

The `getKittiesSorted` function is not yet defined, a good place to define it is in `lib/kitties.js` where also our data fetch logic is situated. For performance and the bespoken API limitations, the aim is not to query the api again, but rather sort the data in memory. Note that this is suitable here, as the collection is < 500 items but it might totally not work for big datasets. So let's put the following at the end of `lib/kitties.js`:

```js
import { orderBy } from 'lodash';

export function getKittiesSorted( kitties, orderby = 'id', order='desc' ) {
  let sortedData;

  if ( orderby === 'forsale' ) {
    sortedData = orderBy( kitties, item => {
      let a = parseInt( item.forsale );
      if ( a === 0 ) {
        a = order === 'desc' ? -1 : Number.MAX_SAFE_INTEGER;
      }
      return a;
    }, order )
  } else {
    sortedData = orderBy( kitties, orderby, order );
  }

  return sortedData;
}
```
What's going on here? It is a very general sorting function with one special case, first look at the `else` part. If we do not want to order by the `forsale` property, we just perform a [`lodash orderBy`](https://www.geeksforgeeks.org/lodash-_-orderby-method/) call, that will order the given array by the property specified in the second parameter in the direction specified in the third parameter - exactly what we needed.

The `forsale` branch is passed a function as the iteratee to `orderBy` that makes sure the order is correct also for items thar are not for sale i.e. where `forsale === 0`. E.g. when ordering for sale we want the cheapest item first (`forsale > 0`), not first all items where `forsale === 0`.

Now let's test the frontend and see if it works by manually changing the initial `sortBy` state values in `pages/index.js` e.g. to:


```js
const [ sort, setSort ] = useState( {
  sortBy: 'forsale',
  sortDir: 'asc',
} );
```

Now all we have to do is wire the existing logic to UI components.

> *If you notice some kitties being doubled, it can be because we are not filtering `burned` kitties. Filtering those is left as a challenge to you, just look at the `burned` property returned from the API*

## The Sorting / Filtering UI

Let's write a new component for that, first the code, then the explanation. File is `components/kitty-stetings.js`.

```js
import classNames from 'classnames';
import { useState } from 'react'

export default function KittySettings( props ) {
  const [ orderBy ] = useState( [ 'desc', 'asc' ] );

  return(
    <div className="kitty-settings">
      <div className="backdrop"></div>
      <div className="kitty-filter">show:
        <a
          className={ classNames( 'filter', { active: props.filter === 'all' } ) }
          onClick={ props.onFilterClick( 'all' ) }
        >
          all
        </a>
        <a
        className={ classNames( 'filter', { active: props.filter === 'forsale' } ) }
          onClick={ props.onFilterClick( 'forsale' ) }
        >
          forsale
        </a>
      </div>
      <div className="kitty-sort">
        sort:
        <a
          className={ classNames( 'sort-by', { active: props.sort.sortBy === 'id' } ) }
          onClick={ props.onSortClick( {
            sortBy: 'id',
            sortDir: props.sort.sortDir === 'asc' ? 'desc' : 'asc',
          } )}
        >
          id
          <span className="descasc">
            { props.sort.sortDir === 'asc' ? '↑' : '↓'}
          </span>
        </a>
        <a
        className={ classNames( 'sort-by', { active: props.sort.sortBy === 'forsale' } ) } 
          onClick={ props.onSortClick( {
            sortBy: 'forsale',
            sortDir: props.sort.sortDir === 'asc' ? 'desc' : 'asc',
          } )}
        >
          price
          <span className="descasc">
            { props.sort.sortDir === 'asc' ? '↑' : '↓'}
          </span>
        </a>
      </div>
      <div className="kitty-filters"></div>
    </div>
  );
}
```

No magic again, basically we are creating 4 clickable dom `<a>`-elements that will call functions that were passed by the parent element via props. We will not write the logic in this component as the sort-order and filter might also be relevant for other metrics later, so it is placed in the parent.

Now all that needs to be done is to put a `<KittySettings>` component to our `page/index.js` page. Put the following in the `<main>` part of the DOM.

```js
<KittySettings
  sort={ sort }
  filter={ kittyFilter }
  onFilterClick={ onFilterClick }
  onSortClick={ onSortClick }
/>
```
Also define the functions above:

```js
const onFilterClick = value => () => {
  setKittyFilter( value );
}

const onSortClick = value => () => {
  setSort( value );
}
```
The functions are calling the `set`-methods of the state variables. Notice that both functions are returning functions not values. 

We will not go over the styles / css, if you checked out the part2 branch you will already have them, if not, have a look in the [repository](https://github.com/niklasp/kitty-explorer).

# Final Thoughts

Thank you for reading this far. And looking forward to part 3 which will teach you how to mirror realtime updates coming from more blockchain, i.e. sales, listings, mints

Follow me on twitter for more #dotsama related things: [@niftesty](https://twitter.com/niftesty)

Or donate some SUB or KSM below this post. It will make me continue.

# Credits + Learning Resources

If you are new to nextjs, start at [learn nextjs](https://nextjs.org/learn/basics/create-nextjs-app).

[rmrk2 boilerplate by Mathew Darnell](https://github.com/MatthewDarnell/rmrk2-template-boilerplate) - it is open source, you can host your own API in a docker container

[Yet Another Medium Zoom](https://github.com/birjj/yet-another-medium-zoom)