#!/bin/zsh

SCRIPT_DIR="${0:A:h}"
SQL_FILE="$SCRIPT_DIR/chat_history_metadata_query.sql"
OUTPUT_FILE="$SCRIPT_DIR/chat_history_metadata.jsonl"

# Check if SQL file exists
if [[ ! -f "$SQL_FILE" ]]; then
  echo "Error: SQL file $SQL_FILE not found."
  exit 1
fi

# Read SQL file, compress to one line, remove trailing semicolon, store in variable
COMPRESSED_SQL=$(cat "$SQL_FILE" | tr -s '[:space:]' ' ' | sed 's/;[[:space:]]*$//')

# Check if compression was successful
if [[ -z "$COMPRESSED_SQL" ]]; then
  echo "Error: Failed to process SQL file"
  exit 1
fi

# Execute the SQL query using the compressed SQL variable
psql -h jetairm1 -p 5432 -U jethroestrada -d chat_history_db1 <<EOF > "$OUTPUT_FILE"
\\copy ($COMPRESSED_SQL) TO STDOUT
EOF

# Check if psql command was successful
if [[ $? -eq 0 ]]; then
  echo "Query executed successfully, output saved to $OUTPUT_FILE"
else
  echo "Error: Failed to execute SQL query"
  exit 1
fi