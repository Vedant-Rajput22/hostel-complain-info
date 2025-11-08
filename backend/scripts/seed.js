import 'dotenv/config'
import { query as db } from '../src/config/db.js'

async function main() {
  // Create sample staff
  await db("INSERT INTO users (name,email,password_hash,role,verified,created_at) VALUES ('Hostel Staff','staff@iiitn.ac.in','$2a$10$Zf2d4M5rYwJb1Hk6RrGxyeh1s6YkG5fWlI9Xf6lZ9zU6r2d1GdEae','staff',1,NOW()) ON DUPLICATE KEY UPDATE email=email")
  // Sample bus timetable
  await db("INSERT INTO bus_timetable (route_name,start_time,end_time,stops,updated_at) VALUES ('Campus Loop','08:00','09:00','[\"Gate\",\"Main Block\",\"Hostel\"]', NOW())")
  // Sample mess timetable
  await db("INSERT INTO mess_timetable (day_of_week, meal_type, menu_items, updated_at) VALUES ('Mon','Breakfast','Poha, Tea', NOW()) ON DUPLICATE KEY UPDATE menu_items=VALUES(menu_items), updated_at=NOW()")
  console.log('Seeded sample data.')
  process.exit(0)
}

main().catch(e=>{ console.error(e); process.exit(1) })

