/**
 * 
 */
package com.nttuyen.dao.query;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
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
			return null;
		}

		public ResultSet result() {
			try {
				PreparedStatement stm = connection.prepareStatement(this.sql);
				return stm.executeQuery();
			} catch (SQLException e) {
				e.printStackTrace();
			}
			return null;
		}
	}
}
