import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgres://default:pzbvxBjJ8rC9@ep-shiny-mountain-a15i3bhm-pooler.ap-southeast-1.aws.neon.tech:5432/verceldb?sslmode=require?sslmode=require",
});

// Using named export for query function
export const query = (text: pkg.QueryArrayConfig<any>, params: any) => pool.query(text, params);

// Using default export for pool
export default pool;
