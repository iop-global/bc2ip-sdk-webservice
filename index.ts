import express, { Request, Response } from 'express';
import { Crypto, Layer2, Network, NetworkConfig } from '@internet-of-people/sdk';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

interface NetworkMap {
  [key: string]: Network;
}

const networkMap: NetworkMap = {
  'testnet': Network.Testnet,
  'devnet': Network.Devnet,
  'mainnet': Network.Mainnet,
}

const network: string = process.env.hydraledgerNetwork!;

const networkConfig = NetworkConfig.fromNetwork(networkMap[network]);
const morpheusApi = Layer2.createMorpheusApi(networkConfig);

app.get('/dids/:did/keys/:publicKey/hasRight/:atHeight', async (req: Request, res: Response) => {
  const didDocument = await morpheusApi.getDidDocument(new Crypto.Did(req.params.did));
  const hasRight = didDocument.hasRightAt(
    new Crypto.PublicKey(req.params.publicKey),
    'impersonate',
    parseInt(req.params.atHeight)
  );
  res.status(200).send(hasRight);
});

app.get('/before-proof/exists/:id', async (req: Request, res: Response) => {
  const exists = await morpheusApi.beforeProofExists(req.params.id);
  res.status(200).send(exists);
});

app.get('/dids/:did/keys/:keyId/hasRight', async (req: Request, res: Response) => {
  const didDocument = await morpheusApi.getDidDocument(new Crypto.Did(req.params.did));
  const hasRight = didDocument.hasRightAt(new Crypto.KeyId(req.params.keyId), 'impersonate', didDocument.height);
  res.status(200).send(hasRight);
});

app.listen(4201, () => {
  console.log(`[SDK Service] listening on 4201 - ${network}`);
});
