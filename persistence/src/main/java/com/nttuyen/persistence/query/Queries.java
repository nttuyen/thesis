/**
 * 
 */
package com.nttuyen.persistence.query;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Collections;
import java.util.List;


/**
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
public class Queries {
	
	public static Criteria createCriteria(Connection connection) {
		return new EntityCriteria(connection);
	}
	
	public static Query createQuery(String query, Connection connection) {
		return null;
	}
	
	public static Query createSQLQuery(String query, Connection connection) {
		return new SQLQuery(query, connection);
	}
	
	private static class SQLQuery implements Query {
		private final String sql;
		private final Connection connection;
		public SQLQuery(String sql, Connection connection) {
			this.sql = sql;
			this.connection = connection;
		}
		
		public <T> List<T> list(Class<T> c) {
            List<T> list = Collections.emptyList();
            try {
                PreparedStatement stm = this.connection.prepareStatement(this.sql);
                stm.execute();
			    list = ResultUtil.fetch(stm.getResultSet(), c);
            } catch (SQLException e) {
                e.printStackTrace();
            }
            return list;
		}

        @Override
        protected void finalize() throws Throwable {
            try {
                this.connection.close();
            } catch (Exception e) {}
        }
    }
}
