export default () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    rabbitmq: {
      url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
      queueName: 'iot_queue',
    },
    database: {
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      username: process.env.POSTGRES_USER || 'user',
      password: process.env.POSTGRES_PASSWORD || 'password',
      database: process.env.POSTGRES_DB || 'iot_data',
      synchronize: true, // Geliştirme ortamında true, üretimde false olmalı
      logging: false,
    },
  });