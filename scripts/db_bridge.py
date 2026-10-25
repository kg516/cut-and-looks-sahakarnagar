#!/usr/bin/env python3
import sys
import sqlite3
import json
import os

def get_connection(db_path):
    conn = sqlite3.connect(db_path, timeout=15.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    return conn

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Invalid arguments"}), file=sys.stderr)
        sys.exit(1)

    db_path = sys.argv[1]
    action = sys.argv[2]
    
    # Input payload from stdin or argv
    try:
        raw_input = sys.stdin.read()
        payload = json.loads(raw_input) if raw_input.strip() else {}
    except Exception as e:
        print(json.dumps({"error": f"JSON decode error: {str(e)}"}), file=sys.stderr)
        sys.exit(1)

    conn = None
    try:
        conn = get_connection(db_path)
        cur = conn.cursor()

        if action == "query":
            sql = payload.get("sql", "")
            params = payload.get("params", [])
            cur.execute(sql, params)
            rows = [dict(r) for r in cur.fetchall()]
            print(json.dumps({"success": True, "data": rows}))

        elif action == "execute":
            sql = payload.get("sql", "")
            params = payload.get("params", [])
            cur.execute(sql, params)
            conn.commit()
            print(json.dumps({
                "success": True,
                "changes": cur.rowcount,
                "lastInsertRowid": cur.lastrowid
            }))

        elif action == "transaction":
            statements = payload.get("statements", [])
            results = []
            conn.execute("BEGIN TRANSACTION;")
            for stmt in statements:
                sql = stmt.get("sql", "")
                params = stmt.get("params", [])
                cur.execute(sql, params)
                results.append({"changes": cur.rowcount, "lastInsertRowid": cur.lastrowid})
            conn.commit()
            print(json.dumps({"success": True, "results": results}))

        else:
            print(json.dumps({"error": f"Unknown action: {action}"}), file=sys.stderr)
            sys.exit(1)

    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main()
