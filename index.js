import express from 'express';
import cors from 'cors';
// import cache from './plugins/cache';
import Pulkovo from './databases/pulkovo';
// import S7 from './databases/s7';

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());

app.get('/track', async (req, res) => {
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
