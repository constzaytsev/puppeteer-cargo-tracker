import express from 'express';
import cors from 'cors';
import apicache from 'apicache';
import Pulkovo from './databases/pulkovo';
// import S7 from './databases/s7';
apicache.options({
  appendKey: (req, res) => req.query.number,
});
const PORT = process.env.PORT || 5000;
const app = express();
const cache = apicache.middleware;

app.use(cors());

app.get('/track', cache('5 minutes'), async (req, res) => {
  const cargoPrefix = req.query.prefix;
  const cargoNumber = req.query.number;

  if (!cargoPrefix) return res.json({ result: { error: 'Не указан префикс груза' } });
  if (!cargoNumber) return res.json({ result: { error: 'Не указан номер груза' } });

  // let database;
  // switch (cargoPrefix) {
  //   case '421':
  //     database = S7;
  //     break;
  //   default:
  //     database = Pulkovo;
  // }

  try {
    const result = await Pulkovo(cargoPrefix, cargoNumber);
    return res.json({
      result: {
        success: result,
      },
    });
  } catch (e) {
    console.log(e);
    return res.json({
      result: {
        error: 'Не найдено',
      },
    });
  }
});

app.use((req, res) => {
  res.status(404).end(); // not found
});

app.listen(PORT, () => {
  /* eslint no-console: 0 */
  console.log(`Listening on ${PORT}`);
});
