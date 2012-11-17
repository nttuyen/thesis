/**
 * 
 */
package com.nttuyen.persistence;

import java.lang.reflect.Field;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

import com.nttuyen.persistence.jdbc.Connector;
import com.nttuyen.persistence.query.ResultUtil;
import org.apache.log4j.Logger;

import com.nttuyen.persistence.annotaion.Column;
import com.nttuyen.persistence.annotaion.Id;
import com.nttuyen.persistence.annotaion.Table;
import com.nttuyen.persistence.query.Criteria;
import com.nttuyen.persistence.query.Queries;
import com.nttuyen.persistence.query.Restrictions;

/**
 * An implement of {@link Persistence} interface
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
public class JDBCPersistence implements Persistence{
	private static final Logger log = Logger.getLogger(JDBCPersistence.class);

	private Connector connector;
	
	public JDBCPersistence(Connector connector) {
		this.connector = connector;
	}
	
	public <T> T getObjectByID(Class<T> c, long id) {
		if(c == null) {
			return null;
		}
		log.info("GET object form " + c.getName() + " by ID=" + id);
		
		try {
			Connection connection = connector.getConnection();
			Criteria criteria = Queries.createCriteria(connection);
			criteria.addEntity(c);
			//Search ID field
			Field[] fields = c.getDeclaredFields();
			for(Field f : fields) {
				Id annotation = f.getAnnotation(Id.class);
				if(annotation != null && !"".equals(annotation.name())) {
					criteria.add(Restrictions.equal(annotation.name(), new Long(id)));
					break;
				}
			}
			List<T> list = criteria.list();
			return list.get(0);
		} catch (SQLException e) {
			log.error("SQLException", e);
		}
		return null;
	}

	public <T> void insert(T object) throws PersistenceException {
		if(object == null) {
			return;
		}
		//Create query
		StringBuilder query = new StringBuilder();
		query.append("INSERT INTO ");
		
		Class<?> c = object.getClass();
		
		//TABLE
		Table table = c.getAnnotation(Table.class);
		if(table == null || "".equals(table.name())) {
			throw new PersistenceException("Class " + c.getName() + " has no-table annotation");
		}
		String tableName = table.name();
		query.append(tableName);
		query.append("(");
		
		//FIELD
		Field[] fields = c.getDeclaredFields();
		boolean first = true;
		int numField = 0;
		for(Field field : fields) {
			//CHECK ID
			Id id = field.getAnnotation(Id.class);
			if(id != null && !"".equals(id.name())) {
				try {
					long val = field.getLong(object);
					if(val != 0) {
						
					}
				} catch (IllegalArgumentException e) {
					
				} catch (IllegalAccessException e) {
					
				}
			}
			
			//CHECK COLUMN
			Column col = field.getAnnotation(Column.class);
			if(col != null && !"".equals(col.name())) {
				if(!first) {
					query.append(", ");
				} else {
					first = false;
				}
				query.append(col.name());
				numField++;
			}
		}
		query.append(")");
		query.append(" VALUE (");
		first = true;
		for(int i = 0; i < numField; i++) {
			if(!first) {
				query.append(", ");
			} else {
				first = false;
			}
			query.append("?");
		}
		query.append(")");
		
		
		//Create PreparedStatement
		try {
			Connection connection = connector.getConnection();
			PreparedStatement stm = connection.prepareStatement(query.toString());
			
			//Fill Value
			int num = 0;
			for(Field field : fields) {
				Column col = field.getAnnotation(Column.class);
				if(col != null && !"".equals(col.name())) {
					num++;
					field.setAccessible(true);
					if(String.class.equals(field.getType())) {
						stm.setString(num, (String)field.get(object));
					} else if(Byte.class.equals(field.getType()) || field.getType().getName().equalsIgnoreCase("byte")) {
						stm.setByte(num, field.getByte(object));
					} else if(Integer.class.equals(field.getType()) || field.getType().getName().equalsIgnoreCase("int")) {
						stm.setInt(num, field.getInt(object));
					} else if(Short.class.equals(field.getType()) || "short".equalsIgnoreCase(field.getType().getName())) {
						stm.setShort(num, field.getShort(object));
					} else if(Long.class.equals(field.getType()) || "long".equalsIgnoreCase(field.getType().getName())) {
						stm.setLong(num, field.getLong(object));
					} else if(Float.class.equals(field.getType()) || "float".equalsIgnoreCase(field.getType().getName())) {
						stm.setFloat(num, field.getFloat(object));
					} else if(Double.class.equals(field.getType()) || "double".equalsIgnoreCase(field.getType().getName())) {
						stm.setDouble(num, field.getDouble(object));
					} else if(Boolean.class.equals(field.getType()) || "boolean".equalsIgnoreCase(field.getType().getName())){
						stm.setBoolean(num, field.getBoolean(object));
					} else {
						stm.setObject(num, field.get(object));
					}
					field.setAccessible(false);
				}
			}
			
			//Execute query
			stm.executeUpdate();
			
			//Retrial ID
			ResultSet rs = stm.getGeneratedKeys();
			if(rs.next()) {
				for(Field field : fields) {
					Id id = field.getAnnotation(Id.class);
					if(id != null && !"".equals(id.name())) {
						field.setAccessible(true);
						field.setLong(object, rs.getLong(1));
						field.setAccessible(false);
					}
				}
			}
			
			connection.close();
		} catch (SQLException e) {
			throw new PersistenceException("PersistenceException", e);
		} catch (IllegalArgumentException e) {
			
		} catch (IllegalAccessException e) {
			
		}
		
	}

	public <T> void update(T object) throws PersistenceException {
		if(object == null) {
			return;
		}
		//Create query
		StringBuilder query = new StringBuilder();
		query.append("UPDATE ");
		
		Class<?> c = object.getClass();
		
		//TABLE
		Table table = c.getAnnotation(Table.class);
		if(table == null || "".equals(table.name())) {
			throw new PersistenceException("Class " + c.getName() + " has no-table annotation");
		}
		String tableName = table.name();
		query.append(tableName);
		query.append(" SET ");
		
		//FIELD
		Field[] fields = c.getDeclaredFields();
		boolean first = true;
		for(Field field : fields) {
			//CHECK COLUMN
			Column col = field.getAnnotation(Column.class);
			if(col != null && !"".equals(col.name())) {
				if(!first) {
					query.append(", ");
				} else {
					first = false;
				}
				query.append(col.name());
				query.append(" = ?");
			}
		}
		
		query.append(" WHERE");
		
		for(Field field : fields) {
			Id id = field.getAnnotation(Id.class);
			if(id != null && !"".equals(id.name())) {
				try {
					long val = field.getLong(object);
					query.append(" ");
					query.append(id.name());
					query.append(" = ");
					query.append(val);
				} catch (IllegalArgumentException e) {
					
				} catch (IllegalAccessException e) {
					
				}
			}
		}
		
		if(query.toString().endsWith("WHERE")) {
			throw new PersistenceException("Object has no-ID");
		}
		
		//Create PreparedStatement
		try {
			Connection connection = connector.getConnection();
			PreparedStatement stm = connection.prepareStatement(query.toString());
			
			//Fill Value
			int num = 0;
			for(Field field : fields) {
				Column col = field.getAnnotation(Column.class);
				if(col != null && !"".equals(col.name())) {
					num++;
					field.setAccessible(true);
					if(String.class.equals(field.getType())) {
						stm.setString(num, (String)field.get(object));
					} else if(Byte.class.equals(field.getType()) || field.getType().getName().equalsIgnoreCase("byte")) {
						stm.setByte(num, field.getByte(object));
					} else if(Integer.class.equals(field.getType()) || field.getType().getName().equalsIgnoreCase("int")) {
						stm.setInt(num, field.getInt(object));
					} else if(Short.class.equals(field.getType()) || "short".equalsIgnoreCase(field.getType().getName())) {
						stm.setShort(num, field.getShort(object));
					} else if(Long.class.equals(field.getType()) || "long".equalsIgnoreCase(field.getType().getName())) {
						stm.setLong(num, field.getLong(object));
					} else if(Float.class.equals(field.getType()) || "float".equalsIgnoreCase(field.getType().getName())) {
						stm.setFloat(num, field.getFloat(object));
					} else if(Double.class.equals(field.getType()) || "double".equalsIgnoreCase(field.getType().getName())) {
						stm.setDouble(num, field.getDouble(object));
					} else if(Boolean.class.equals(field.getType()) || "boolean".equalsIgnoreCase(field.getType().getName())){
						stm.setBoolean(num, field.getBoolean(object));
					} else {
						stm.setObject(num, field.get(object));
					}
					field.setAccessible(false);
				}
			}
			
			//Execute query
			stm.executeUpdate();
			
			connection.close();
		} catch (SQLException e) {
			throw new PersistenceException("PersistenceException", e);
		} catch (IllegalArgumentException e) {
			
		} catch (IllegalAccessException e) {
			
		}
	}
	
	public <T> void save(T object) throws PersistenceException {
		if(object == null) {
			return;
		}
		
		Class<?> c = object.getClass();
		Field[] fields = c.getDeclaredFields();
		for(Field field : fields) {
			Id id = field.getAnnotation(Id.class);
			if(id != null && !"".equals(id.name())) {
				try {
					long val = field.getLong(object);
					if(val == 0) {
						this.insert(object);
						return;
					} else {
						this.update(object);
						return;
					}
				} catch (IllegalArgumentException e) {
				} catch (IllegalAccessException e) {
				}
			}
		}
	}
	
	public <T> void remove(T object) throws PersistenceException {
		if(object == null) {
			return;
		}
		
		StringBuilder query = new StringBuilder();
		query.append("DELETE FROM ");
		
		Class<?> c = object.getClass();
		
		Table table = c.getAnnotation(Table.class);
		if(table == null || "".equals(table.name())) {
			throw new PersistenceException("Class" + c.getName() + " has no-table annotation");
		}
		query.append(table.name());
		query.append(" WHERE");
		
		Field[] fields = c.getDeclaredFields();
		for(Field field : fields) {
			Id id = field.getAnnotation(Id.class);
			if(id != null && !"".equals(id.name())) {
				try {
					long val = field.getLong(object);
					query.append(" ");
					query.append(id.name());
					query.append(" = ");
					query.append(val);
					break;
				} catch (IllegalArgumentException e) {
				} catch (IllegalAccessException e) {
				}
			}
		}
		
		String sql = query.toString().trim();
		if(sql.endsWith("WHERE")) {
			throw new PersistenceException("Object has no-ID");
		}
		
		try {
			Connection connection = connector.getConnection();
			PreparedStatement stm = connection.prepareStatement(sql);
			stm.executeUpdate();
			connection.close();
		} catch (SQLException e) {
		}
		
	}
	
	public <T> Iterator<T> list(Class<T> c, long start, int limit) {
        List<T> list = Collections.emptyList();
        try {
            Connection connection = connector.getConnection();
            Criteria criteria = Queries.createCriteria(connection);
            criteria.addEntity(c);
            criteria.limit(start, limit);
            list = criteria.list();
        } catch (Exception e){
            log.error("SQLException", e);

        }
        return list.iterator();
	}

    public <T> Iterator<T> list(Class<T> c, String query) {
        List<T> list = Collections.emptyList();
        try {
            Connection connection = connector.getConnection();
            PreparedStatement stm = connection.prepareStatement(query);
            ResultSet rs = stm.executeQuery();
            list = ResultUtil.fetch(rs, c);
        } catch (Exception e) {
            log.error("Query Exception", e);
        }
        return list.iterator();
    }

	public <T> Iterator<T> listAll(Class<T> c) {
        List<T> list = Collections.emptyList();
        try {
			Connection connection = connector.getConnection();
			Criteria criteria = Queries.createCriteria(connection);
			criteria.addEntity(c);
			list = criteria.list();
		} catch (SQLException e) {
			log.error("SQLException", e);
		}
		return list.iterator();
	}
}
