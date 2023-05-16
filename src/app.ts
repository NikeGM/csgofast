import { config } from 'dotenv';
config();
import logger from 'src/utils/log'
import { Container } from 'src/container';


const container = new Container();

container.api.start()
