import express from 'express'
import cors from 'cors'
import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import path from 'path'
import KosRoute from './routers/kosRoute'
import UserRoute from './routers/userRoute'
import LikeRoute from './routers/likeRoute'
import ReviewRoute from './routers/reviewRoute'
import BookRoute from './routers/bookRoute'
import KosFacilitiesRoute from './routers/kosFacilitiesRoute'
import BookingCalendarRoute from './routers/bookingCalendarRoute'
// import OrderRoute from '../../orderRoute'
// import ReportRoute from '../../reportRoute'

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
                bearerAuth: { // Nama skema keamanan
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT', // Format token
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routers/*.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.use(`/kos`, KosRoute)
app.use(`/user`, UserRoute)
app.use(`/like`, LikeRoute)
app.use(`/review`, ReviewRoute)
app.use(`/book`, BookRoute)
app.use(`/facilities`, KosFacilitiesRoute)
app.use(`/booking-calendar`, BookingCalendarRoute)
// app.use(`/order`, OrderRoute)
// app.use(`/report`, ReportRoute)

// Set public folder as static
app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`)
})
