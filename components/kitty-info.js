import classNames from "classnames";

export default function KittyInfo( props ) {
  const classes = classNames('kitty-info', { hidden: props.hidden });
  return(
    <div className={ classes } onClick={ props.handleClick }>
      <h3>Kitty Explorer</h3>
      <p>There are currently { props.forSaleCount } / { props.totalCount } kitties listed on singular.</p>
      <p>
        Floor: { props.floorKitties.price / 0.9 / 1000000000000  } KSM -
        { props.floorKitties.kitties.map( kit => (<span className="floor-kitty"><a href={ `https://singular.app/collectibles/${ kit.uuid }` } target='_blank'>Kitty #{ kit.id }</a></span>) ) }
      </p>
      <p>The beautiful kitties are made by Yumi <a href="https://twitter.com/YumiArtsNFT" target="_blank">@YumiArtsNFT</a></p>
      <p>Coding: <a href="https://github.com/niklasp" target="_blank">niklasp</a></p>
      <p>The unofficial singular API is kindly provided by <a href="https://github.com/MatthewDarnell/rmrk2-template-boilerplate" target="_blank">Matthew Darnell</a>. <br/>
        An official API is currently only available to users who apply in the <a href="https://t.me/rmrkimpl" target="_blank">RMRK implementers - Telegram Group</a></p>
    </div>
  )
}