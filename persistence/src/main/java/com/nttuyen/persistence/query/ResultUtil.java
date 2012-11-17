/**
 * 
 */
package com.nttuyen.persistence.query;

import java.lang.reflect.Field;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.nttuyen.persistence.annotaion.Column;
import com.nttuyen.persistence.annotaion.Id;
import com.nttuyen.persistence.annotaion.Table;

/**
 * Process ResutSet from query
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
public class ResultUtil {
	
	/**
	 * Fetch current row of resultSet into objects
	 * This method use reflection, field type is supported:
	 * - Primary type: byte, short, int, long, float, double, char
	 * - String type
	 * - Object type (implemented {@link java.io.Serializable})
	 * @param rs - resultSet object
	 * @param objects - list of object need fill data to
	 */
	public static void fetch(ResultSet rs, Object...objects) {
		for(Object obj : objects) {
			Class<?> c = obj.getClass();
			
			//TABLE
			Table table = c.getAnnotation(Table.class);
			String tableName = "";
			if(table != null && table.name() != null && !"".equals(table.name())) {
				tableName = table.name();
			} else {
				throw new UnsupportedOperationException("Class does not have @Table annotation");
			}
			
			//FIELD
			Field[] fields = c.getDeclaredFields();
			for(Field f : fields) {
				//CHECK ID
				Id id = f.getAnnotation(Id.class);
				if(id != null && id.name() != null && !"".equals(id.name())) {
					String idName = id.name();
					f.setAccessible(true);
					try {
						long value = rs.getLong(tableName + "." + idName);
						f.setLong(obj, value);
					} catch(SQLException e) {
						
					} catch (IllegalArgumentException e) {
						e.printStackTrace();
					} catch (IllegalAccessException e) {
						e.printStackTrace();
					}
					f.setAccessible(false);
					continue;
				}
				
				//CHECK COLUMN
				Column col = f.getAnnotation(Column.class);
				if(col != null && col.name() != null && !"".equals(col.name())) {
					try {
						f.setAccessible(true);
						String colName = col.name();
						
						if(String.class.equals(f.getType())) {
							f.set(obj, rs.getString(tableName + "." + colName));
						} else if(Byte.class.equals(f.getType()) || "byte".equalsIgnoreCase(f.getType().getName())) {
							f.setByte(obj, rs.getByte(tableName + "." + colName));
						} else if(Integer.class.equals(f.getType()) || "int".equalsIgnoreCase(f.getType().getName())) {
							f.setInt(obj, rs.getInt(tableName + "." + colName));
						} else if(Short.class.equals(f.getType()) || "short".equalsIgnoreCase(f.getType().getName()) ) {
							f.setShort(obj, rs.getShort(tableName + "." + colName));
						} else if(Long.class.equals(f.getType()) || "long".equalsIgnoreCase(f.getType().getName())) {
							f.setLong(obj, rs.getLong(tableName + "." + colName));
						} else if(Float.class.equals(f.getType()) || "float".equalsIgnoreCase(f.getType().getName())) {
							f.setFloat(obj, rs.getFloat(tableName + "." + colName));
						} else if(Double.class.equals(f.getType()) || "double".equalsIgnoreCase(f.getType().getName())) {
							f.setDouble(obj, rs.getDouble(tableName + "." + colName));
						} else if(Boolean.class.equals(f.getType()) || "boolean".equalsIgnoreCase(f.getType().getName())){
							f.setBoolean(obj, rs.getBoolean(tableName + "." + colName));
						} else {
							f.set(obj, rs.getObject(col.name()));
						}
						
						f.setAccessible(false);
					} catch(SQLException e) {
						
					} catch (IllegalArgumentException e) {
						e.printStackTrace();
					} catch (IllegalAccessException e) {
						e.printStackTrace();
					}
				}
			}
		}
	}

	/**
	 * Fetch List of object in one type from ResultSet object
	 * This method use reflection, field type is supported:
	 * - Primary type: byte, short, int, long, float, double
	 * - String type
	 * - Object (implements {@link java.io.Serializable})
	 * @param <T>
	 * @param rs - resultSet object
	 * @param c - type of objects
	 * @return - list of objects
	 */
	public static <T> List<T> fetch(ResultSet rs, Class<T> c) {
		List<T> list = new ArrayList<T>();
		try {
			rs.beforeFirst();
			while(rs.next()) {
				T t = c.newInstance();
				ResultUtil.fetch(rs, t);
				list.add(t);
			}
			return list;
		} catch (SQLException e) {
			e.printStackTrace();
		} catch (InstantiationException e) {
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			e.printStackTrace();
		}
		return null;
	}
}
