import { config } from 'dotenv';
config();
import { Container } from 'src/container';


const container = new Container();

container.api.start()