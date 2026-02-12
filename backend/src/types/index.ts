import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import path from 'path'
import KosRoute from '../routers/kos-routes'
import UserRoute from '../routers/user-routes'
import LikeRoute from '../routers/like-routes'
import ReviewRoute from '../routers/review-routes'
import BookRoute from '../routers/book-routes'
import KosFacilitiesRoute from '../routers/kos-facilities-routes'
import KosImageRoute from '../routers/kos-image-routes'
import BookingCalendarRoute from '../routers/booking-calendar-routes'
import NotificationRoute from '../routers/notification-routes'


import { PORT } from './global'

const app = express()
app.use(cors())
app.use(express.json())

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Ordering System API',
            version: '1.0.0',
            description: 'API documentation for the ordering system',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routers/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.use(`/kos`, KosRoute)
app.use(`/user`, UserRoute)
app.use(`/like`, LikeRoute)
app.use(`/review`, ReviewRoute)
app.use(`/books`, BookRoute)
app.use(`/facilities`, KosFacilitiesRoute)
app.use(`/kos-images`, KosImageRoute)
app.use(`/booking-calendar`, BookingCalendarRoute)
app.use(`/notifications`, NotificationRoute)

app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`)
})
