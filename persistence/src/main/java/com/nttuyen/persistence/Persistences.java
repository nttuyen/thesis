/**
 * 
 */
package com.nttuyen.persistence;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

import com.nttuyen.persistence.annotaion.SQL;
import com.nttuyen.persistence.jdbc.Connector;
import com.nttuyen.persistence.jdbc.ConnectorFactory;
import com.nttuyen.persistence.query.QueryUtil;
import com.nttuyen.persistence.query.ResultUtil;

/**
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
public class Persistences {
	
	private static final Map<Properties, Persistence> map = new HashMap<Properties, Persistence>();
	
	private Persistences() {
		
	}
	
	/**
	 * Get Persistence with Config object
	 * @param cfg
	 * @return void
	 */
	public static Persistence getPersistence(Properties cfg) {
		if(map.get(cfg) != null) {
			return map.get(cfg);
		} else {
			Connector connector = ConnectorFactory.createConnector(cfg);
			Persistence p = new JDBCPersistence(connector);
			map.put(cfg, p);
			return p;
		}
	}
}

final class PersistenceHandle implements InvocationHandler {

	private Connection connection;
	
	public PersistenceHandle(Connection connection) {
		this.connection = connection;
	}
	
	@SuppressWarnings("unchecked")
	public Object invoke(Object proxy, Method method, Object[] args)
			throws Throwable {
		SQL query = method.getAnnotation(SQL.class);
		if(query == null || "".equals(query.sql())) {
			throw new UnsupportedOperationException("This method hasn't get SQL annotation");
		}
		String sql = query.sql();
		PreparedStatement stm = connection.prepareStatement(sql);
		stm = QueryUtil.fillStatement(stm, args);
		System.out.println(stm.toString());
		String sqlChecl = sql.toLowerCase();
		if(sqlChecl.contains("select")) {
			ResultSet rs = stm.executeQuery();
			if(method.getReturnType().equals(Void.TYPE)) {
				return null;
			} else if(method.getReturnType().equals(List.class)){
				Class<?> c = query.retClass();
					try {
						if(String.class.equals(c)) {
							List<String> list = new LinkedList<String>();
							while(rs.next()) {
								list.add(rs.getString(1));
							}
							return list;
						} else if(Byte.class.equals(c) || "byte".equalsIgnoreCase(c.getName())) {
							List<Byte> list = new LinkedList<Byte>();
							while(rs.next()) {
								list.add(rs.getByte(1));
							}
							return list;
						} else if(Integer.class.equals(c) || "int".equalsIgnoreCase(c.getName())) {
							List<Integer> list = new LinkedList<Integer>();
							while(rs.next()) {
								list.add(rs.getInt(1));
							}
							return list;
						} else if(Short.class.equals(c) || "short".equalsIgnoreCase(c.getName()) ) {
							List<Short> list = new LinkedList<Short>();
							while(rs.next()) {
								list.add(rs.getShort(1));
							}
							return list;
						} else if(Long.class.equals(c) || "long".equalsIgnoreCase(c.getName())) {
							List<Long> list = new LinkedList<Long>();
							while(rs.next()) {
								list.add(rs.getLong(1));
							}
							return list;
						} else if(Float.class.equals(c) || "float".equalsIgnoreCase(c.getName())) {
							List<Float> list = new LinkedList<Float>();
							while(rs.next()) {
								list.add(rs.getFloat(1));
							}
							return list;
						} else if(Double.class.equals(c) || "double".equalsIgnoreCase(c.getName())) {
							List<Double> list = new LinkedList<Double>();
							while(rs.next()) {
								list.add(rs.getDouble(1));
							}
							return list;
						} else if(Boolean.class.equals(c) || "boolean".equalsIgnoreCase(c.getName())){
							List<Boolean> list = new LinkedList<Boolean>();
							while(rs.next()) {
								list.add(rs.getBoolean(1));
							}
							return list;
						} else if(Date.class.equals(c) || java.sql.Date.class.equals(c)) {
							List<Date> list = new LinkedList<Date>();
							while(rs.next()) {
								list.add(rs.getDate(1));
							}
							return list;
						}
					}catch(SQLException e) {
						return new LinkedList();
					}
				
				if(Object.class.equals(c)) {
					throw new UnsupportedOperationException("RETURN LIST FALSE");
				}
				return ResultUtil.fetch(rs, c);
			} else {
				if(rs.next()) {
					Class<?> c = method.getReturnType();
					if(c.isPrimitive() || String.class.equals(c) || Date.class.equals(c) || java.sql.Date.class.equals(c)) {
						try {
							if(String.class.equals(c)) {
								return rs.getString(1);
							} else if(Byte.class.equals(c) || "byte".equalsIgnoreCase(c.getName())) {
								return rs.getByte(1);
							} else if(Integer.class.equals(c) || "int".equalsIgnoreCase(c.getName())) {
								return rs.getInt(1);
							} else if(Short.class.equals(c) || "short".equalsIgnoreCase(c.getName()) ) {
								return rs.getShort(1);
							} else if(Long.class.equals(c) || "long".equalsIgnoreCase(c.getName())) {
								return rs.getLong(1);
							} else if(Float.class.equals(c) || "float".equalsIgnoreCase(c.getName())) {
								return rs.getFloat(1);
							} else if(Double.class.equals(c) || "double".equalsIgnoreCase(c.getName())) {
								return rs.getDouble(1);
							} else if(Boolean.class.equals(c) || "boolean".equalsIgnoreCase(c.getName())){
								return rs.getBoolean(1);
							} else if(Date.class.equals(c) || java.sql.Date.class.equals(c)) {
								return rs.getDate(1);
							}
						}catch(SQLException e) {
							if(String.class.equals(c)) {
								return "";
							} else if(Boolean.class.equals(c) || "boolean".equalsIgnoreCase(c.getName())){
								return false;
							} else {
								return 0;
							}
						}
					}
					System.out.println("yes");
					Object obj = c.newInstance();
					ResultUtil.fetch(rs, obj);
					System.out.println("Obj: " + obj);
					return obj;
				} else {
					return null;
				}
			}
		} else {
			try {
				return stm.executeUpdate();
			} catch(SQLException ex) {
				return 0;
			}
		}
	}
	
}
