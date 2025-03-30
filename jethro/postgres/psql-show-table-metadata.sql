WITH columns AS (
    SELECT 
        'COLUMNS' AS section,
        jsonb_build_object(
            'column_name', c.column_name,
            'data_type', c.data_type,
            'is_nullable', c.is_nullable,
            'column_default', c.column_default
        ) AS details
    FROM information_schema.columns c
    WHERE c.table_name = 'history'
),
constraints AS (
    SELECT 
        'CONSTRAINTS' AS section,
        jsonb_build_object(
            'constraint_name', con.conname,
            'constraint_type', 
            CASE con.contype 
                WHEN 'p' THEN 'PRIMARY KEY' 
                WHEN 'u' THEN 'UNIQUE' 
                WHEN 'f' THEN 'FOREIGN KEY' 
                WHEN 'c' THEN 'CHECK' 
                ELSE con.contype END,
            'table_name', con.conrelid::regclass
        ) AS details
    FROM pg_constraint con
    WHERE con.conrelid = 'history'::regclass
),
indexes AS (
    SELECT 
        'INDEXES' AS section,
        jsonb_build_object(
            'index_name', idx.indexname,
            'index_definition', idx.indexdef
        ) AS details
    FROM pg_indexes idx
    WHERE idx.tablename = 'history'
),
enums AS (
    SELECT 
        'ENUMS' AS section,
        jsonb_build_object(
            'column_name', col.column_name,
            'enum_name', typ.typname,
            'enum_value', enum.enumlabel
        ) AS details
    FROM pg_type typ
    JOIN pg_enum enum ON typ.oid = enum.enumtypid
    JOIN information_schema.columns col ON col.udt_name = typ.typname
    WHERE col.table_name = 'history'
),
table_info AS (
    SELECT 
        'TABLE_INFO' AS section,
        jsonb_build_object(
            'schema_name', schemaname,
            'table_name', tablename,
            'table_owner', tableowner
        ) AS details
    FROM pg_tables
    WHERE tablename = 'history'
),
triggers AS (
    SELECT 
        'TRIGGERS' AS section,
        jsonb_build_object(
            'trigger_name', tgname,
            'trigger_type', CAST(tgtype AS integer),
            'table_name', relname
        ) AS details
    FROM pg_trigger 
    JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
    WHERE relname = 'history'
),
foreign_keys AS (
    SELECT 
        'FOREIGN_KEYS' AS section,
        jsonb_build_object(
            'constraint_name', con.conname,
            'table_name', conrelid::regclass,
            'referenced_table', confrelid::regclass,
            'column_name', a.attname,
            'referenced_column', fa.attname
        ) AS details
    FROM pg_constraint con
    JOIN pg_attribute a ON a.attnum = ANY(con.conkey) AND a.attrelid = con.conrelid
    JOIN pg_attribute fa ON fa.attnum = ANY(con.confkey) AND fa.attrelid = con.confrelid
    WHERE con.contype = 'f' AND con.conrelid = 'history'::regclass
),
storage AS (
    SELECT 
        'STORAGE' AS section,
        jsonb_build_object(
            'table_name', stat.relname,
            'table_type', cls.relkind,
            'estimated_rows', cls.reltuples,
            'total_size', pg_size_pretty(pg_total_relation_size(cls.oid))
        ) AS details
    FROM pg_catalog.pg_statio_user_tables stat
    JOIN pg_class cls ON cls.oid = stat.relid
    WHERE stat.relname = 'history'
)
SELECT * FROM columns
UNION ALL
SELECT * FROM constraints
UNION ALL
SELECT * FROM indexes
UNION ALL
SELECT * FROM enums
UNION ALL
SELECT * FROM table_info
UNION ALL
SELECT * FROM triggers
UNION ALL
SELECT * FROM foreign_keys
UNION ALL
SELECT * FROM storage;
