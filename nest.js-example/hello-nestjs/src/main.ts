import { NestFactory } from "@nestjs/core";
import { HelloModule } from "./hello.module";

async function bootstrap() {
	const app = await NestFactory.create(HelloModule);
	await app.listen(3000, () => {
		console.log("http://localhost:3000");
	});
}

bootstrap();
