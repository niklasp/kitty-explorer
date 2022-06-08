Kitty Part 1

You are reading part 1/3 on how to create a nifty front-end for your favorite NFT collection on singular.app using the latest web frameworks with advanced caching mechanisms. 

# In part 1 you will learn

- How to get a json dump of RMRK NFTs
- How RMRK NFTs are stored
- How to use react + nextjs to create a fast serverless front-end
- How to use static site generation for fast site creation
- How to create a nice UI / UX
- How to host the app on vercel

If you already know all that, you can skim this tutorial and wait for the second part.

Part 2 will focus on the usage of an API to periodically refresh the UI with fresh data from the blockchain, adding some simple statistics (e.g. floor price) and filter + sorting. Part 3 will cover realtime updates and notifications as well as. advanced statistics (e.g. past purchases).

# Prerequisites + Setting Up

This should not be your first frontend app, i.e. you should be fluent in html + css + js and have already tried react. You should be able to navigate github and use the terminal. If you do not know the listed, maybe start here and navigate your path through the web of free tutorials.

The kitty explorer github repository can help you along this first part. The main branch is the finished version that is currently hosted on [kitty-explorer.vercel.app](https://kitty-explorer.vercel.app). But if you want to follow along and code some parts yourself you can checkout the `part-1-start` branch and fill in the gaps marked with `//TODO`. It is not too complicated so if you want a challenge giveyourself 15min to 1h and try to code it yourself. If you just want to read here and see the code, checkout the `part-1-complete` branch. The following paragraphs will explain the key concepts and code parts.

```
# clone the repo and checkout the correct branch
git clone git@github.com:niklasp/kitty-explorer.git
git checkout part-1-complete

# install required npm packages
npm i

# run the local next.js development server at localhost:3000
npm run dev
```

# Getting the data

The process of getting RMRK NFT data from Kusama consists of the following steps

```
1. Query some blockchain rpc endpoint for Remarks (RMRK Extrinsic) ->
2. Consolidate those Remarks to get contained JSON Data
3. Filter that JSON data for the collection you want
4. (listen to new blocks and start with 1.)
```

Luckily we do not have to do all of this (right now - will do in part 3), but there is up to date downloads downloads available for step 1 and step 2, and a handy unofficial API for step3. We will now use that API to get JSON data from the collection we want to query.

```
http://138.68.123.124/get_nfts_by_collection/800f8a914281765a7d-KITTY
```

In the repo you can already find an (outdated) dump of the collection in `lib/kitties.json`. Either work with that or download a new dump by overriding that file with the one from the API.

[ IMAGE from the json dump ]

|| Note for later that the metadata we get is a string, so we will have to parse it to json to work with it later.

If you want more information and try out consolidating your own blockchain dumps, read on here.

Now that you have the data in your app, let's go and display it

# Writing the controller

We start by writing a controller that will provide the application with the data we want (later we can reuse the code for blockchain queries). Open the file `lib/kitties.js`.

```js
import { orderBy } from "lodash";
import jsonData from './kitties.json';

export async function getKitties() {

  // transform the data we get from the json to a format we want
  const realKittyData = jsonData.map( ( kitObj ) => {
    // ...
  });

  // sort the data by id desc
  const sortedData = orderBy( realKittyData, item => item[ 'id' ], [ 'desc' ]);

  return {
    kitties: sortedData,
  };
}

```
First, we need to transform the data, that is a step of great importance, not only in this app but usually you would want to reformat the data by either renaming, aggregating or laying out the received data differently unless the API is really perfect :)

We are adding a simple `id` field e.g. as you maybe saw from the json dump the fields we get for each NFT are soething like
```json
...
id: "12125948-800f8a914281765a7d-KITTY-KITTY_PARADISE_40-00000040",
symbol: "KITTY_PARADISE_40",
...
```
While for the frontend we would just rather need the id `40` in this case. Still we are keeping the id in a new `uuid` field, as we will need that for the URI of the NFT on singular.app.

Finally the data is sorted descending by `id` using lodash's [orderby function](https://lodash.com/docs/4.17.15#orderBy) (also see [iteratee doc](https://lodash.com/docs/4.17.15#iteratee)) - no need to reinvent the wheel here, just make use of all those handy npm packages around. In Part 2 you will see different orders implemented (price e.g.).

# Leveraging Static Site Generation

We will use next.js `Static Site Generation` that will pregenerate sites generate a site on build-time of the app. That way the site loads lightning fast and the API is not queried on every page load but cached by nextjs.

> How does it work? Well, in Next.js, when you export a page component, you can also export an async function called `getStaticProps`. If you do this, then:
> - getStaticProps runs at build time in production, and…
>  - Inside the function, you can fetch external data and send it as props to the page.
> 
> ([https://nextjs.org/learn/basics/data-fetching/with-data](https://nextjs.org/learn/basics/data-fetching/with-data))

So on our `pages/index.js` page we want to define the `async` `getStaticProps` function that gets the controllers `kitties` data and provides it to the Static site generator.

```js
import { getKitties } from '../lib/kitties'

export async function getStaticProps() {
  const { kitties } = await getKitties();

  return {
    props: {
      allKitties: kitties,
    },
  }
}
```

By returning `allKitties` inside the props object in getStaticProps, the kitties from the jsonDump (later from the API) will be passed to the Home component as a prop. Now you can access the kitties on that page like so:

```
export default function Home( { allKitties } ) { ... }
```

# Writing the `KittyCard` and `KittyGrid` components

Now that we have the data on the page, we can write two [react components](https://reactjs.org/docs/components-and-props.html) to actually display them.
- `KittyCard` will display a single kitty image along with a name and a link to the singular NFT. It will also provide the DOM needed to render the popups that happen when the users click on the kitty.
- `KittyGrid` is basically a wrapper for all the kitties, providing css classes for styling and can later handle detail data fetching when single kitties are clicked. It will display a error message if no kitties are found / supplied from page props.

Let's start with `KittyGrid` in `components/kitty-grid.js`
```js
export default function KittyGrid( props ) {
  ...

  return (
    <div className={ classes }>
      { props.allKitties && props.allKitties.length ? props.allKitties.map( kit => {
        return <KittyCard
          mediaUri={ kit.metadata.mediaUri }
          id={ kit.id }
          key={ kit.uuid }
          uuid={ kit.uuid }
          forsale={ kit.forsale }
          description={ kit.metadata.description }
        />
      }) : <div>no kitties found</div> }
    </div>
  );

  ...
}
```
It checks if `allKitties` were provided in the component props and `maps` over them to display a single `<KittyCard>` component for each `kit`, passing down the needed props.

The `KittyCard` component will then render all the passed props to an nextjs `<Image>`.

```js
export default function KittyCard( props ) {
  const {
    id,
    uuid,
    mediaUri,
    forsale,
    description,
    handleClick,
  } = props;

  ...

  return (
    <div className={ classes }>
      <div className="kitty-name">
        { `Kitty Paradise #${ id }` }
      </div>
      { mediaUri ?
        <Image
          key={ uuid }
          src={ mediaUri }
          alt={ `Kitty Paradise #${ id }` }
          width={ 640 }
          height={ 640 }
          data-zoomable
          data-album="kitties-album"
          data-id={ uuid }
          data-forsale={ forsale }
          data-title={ `Kitty Paradise #${ id }` }
          data-description={ description }
          onError={ handleSrcError }
        /> :
        <div className="kitty-image-error">ipfs error - try later</div>
      }
      <div className="kitty-meta">
        { forsale !== '0' ?
          <a
            href={ `https://singular.app/collectibles/${ uuid }` }
            target='_blank'
          >
            Buy for 
            <span className="kitty-price">
              { forsale / 0.9 / 1000000000000 } KSM
            </span>
          </a>
        :
          <a
            href={ `https://singular.app/collectibles/${ uuid }` }
            target='_blank'
          >
            View on Singular
          </a>
        }
      </div>
    </div>
  )
}
```
It seems a lot of code, but it is basically the [next.js `<Image>`](https://nextjs.org/docs/basic-features/image-optimization#remote-images) component. It is an optimized `<img>` with lazy loading and other performance optimizations applied.

Also note the `data-` attributes. They are needed for the zoom-plugin you will learn about in the next chapter. The `kitty-name` and `kitty-meta` divs are hidden by default and only shown on hover. 

In `kitty-meta`, you see a condition that checks if `forsale !== '0'`. Remeber the data from the json dump? There is no boolean attribute we could use as a value but rather the `forsale` attribute has the value `0` when an NFT is not for sale. Second caveat, the `forsale` attribute does not store the price you can purchase the NFT for, but rather the price, the seller will get. The difference is the creator royalities, that means, if it is for sale, the price can be calculated with
```
price = forsale / ( 1 - royalities for the collection in % ) / 1000000000000
```
So, in both cases - for sale and not for sale - we add a link to singular. But in case it is for sale, also the price one has to pay is displayed.

## Adding Style


Now all we have to do is to add the required css. For simplicity all styles are globally added in `styles/app.scss` which is included into all pages via the [`pages/_app.js`](https://nextjs.org/learn/basics/assets-metadata-css/global-styles) file. We leave it as a challenge to the readers to use [`Layout Components`](https://nextjs.org/learn/basics/assets-metadata-css/layout-component) or any other style option available to react.

# The Zoom UX

For the website the idea is not only to see all the NFT artwork in overview but also to focus on one, and to zoom it in and see it larger.

There are many image zoom plugins or lightbox plugins around. Personally I tend to use [`medium-zoom`](https://github.com/francoischalifour/medium-zoom), but it has it's difficulties with absolute positioned elements the next.js `<Image>` component adds to the dom. So I found [`yet another medium zoom` (yamz)](https://github.com/birjj/yet-another-medium-zoom) which solves the task flawlessly and on top provides options for manipulating the zoomed DOM. That way we can also add some more details next to the zoomed kitty

The initialization logic of yamz is located in a `useEffect` hook that will fire when the component is rendered.

```js
  useEffect(() => {
    const $images = [...document.querySelectorAll('[data-zoomable]')];
    yamz.setOptions({
      duration: 150,
      lightboxGenerator: customLightboxGenerator,
    });
    yamz.bind($images);
  }, []);
```

Basically it is creating the zoom logic for all `$images` and adding the `customLightboxGenerator` which is imported from `lib/yamz.js`. The generator is basically the one from the [github example of yamz](https://github.com/birjj/yet-another-medium-zoom/blob/master/website/js/index.ts) with some adaptions and css styles added.

# Final Thoughts

Thank you for reading this far. And looking forward to part 2 + 3 with more blockchain interaction.

Follow me on twitter for more #dotsama related things: [@niftesty](https://twitter.com/niftesty)

Or donate some SUB or KSM below this post. It will make me continue.

# Credits + Learning Resources

If you are new to nextjs, start at [learn nextjs](https://nextjs.org/learn/basics/create-nextjs-app).

[rmrk2 boilerplate by Mathew Darnell](https://github.com/MatthewDarnell/rmrk2-template-boilerplate) - it is open source, you can host your own API in a docker container

[Yet Another Medium Zoom](https://github.com/birjj/yet-another-medium-zoom)