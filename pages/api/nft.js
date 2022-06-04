import nc from "next-connect";
import cors from "cors";

const handler = nc()
  // use connect based middleware
  .use(cors())
  .post(async (req, res) => {
    const response = await fetch('http://138.68.123.124/get_nft_by_id/', {});
    // console.log( 'response from api server', response );
    res.json(response);
  });

export default handler;