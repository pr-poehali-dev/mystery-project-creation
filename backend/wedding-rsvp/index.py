"""Сохранение и получение подтверждений гостей свадьбы Кирилла и Полины"""
import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        name = body.get("name", "").strip()
        attendance = body.get("attendance", "yes")
        guests_count = int(body.get("guests_count", 1))
        dietary = body.get("dietary", "").strip()
        message = body.get("message", "").strip()

        if not name:
            return {
                "statusCode": 400,
                "headers": cors,
                "body": json.dumps({"error": "Имя обязательно"}),
            }

        ne = name.replace("'", "''")
        ae = attendance.replace("'", "''")
        de = dietary.replace("'", "''")
        me = message.replace("'", "''")
        gc = int(guests_count)

        sql = "INSERT INTO t_p93124215_mystery_project_crea.wedding_rsvp (name, attendance, guests_count, dietary, message) VALUES ('" + ne + "', '" + ae + "', " + str(gc) + ", '" + de + "', '" + me + "') RETURNING id"

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(sql)
        row_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return {
            "statusCode": 200,
            "headers": cors,
            "body": json.dumps({"success": True, "id": row_id}),
        }

    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, name, attendance, guests_count, dietary, message, created_at FROM t_p93124215_mystery_project_crea.wedding_rsvp ORDER BY created_at DESC"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()

        result = [
            {
                "id": r[0],
                "name": r[1],
                "attendance": r[2],
                "guests_count": r[3],
                "dietary": r[4],
                "message": r[5],
                "created_at": str(r[6]),
            }
            for r in rows
        ]
        return {
            "statusCode": 200,
            "headers": cors,
            "body": json.dumps(result, ensure_ascii=False),
        }

    return {"statusCode": 405, "headers": cors, "body": "Method Not Allowed"}
