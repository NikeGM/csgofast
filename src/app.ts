import { config } from 'dotenv';
config();
import logger from 'src/utils/log'
import { Container } from 'src/container';


const container = new Container();

container.api.start()
const items = await container.externalApi.getItemsList();
console.log(items.slice(0, 10))