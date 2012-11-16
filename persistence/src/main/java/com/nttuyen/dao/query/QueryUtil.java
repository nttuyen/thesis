/**
 * 
 */
package com.nttuyen.dao.query;

import java.lang.reflect.Field;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.nttuyen.dao.annotaion.Column;
import com.nttuyen.dao.annotaion.Id;
import com.nttuyen.dao.annotaion.Table;

/**
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
public class QueryUtil {
	public static String processQuery(String query, Properties config) {
		Pattern pattern = Pattern.compile("\\{[^{}]*\\}");
		if(query == null || config == null) {
			return "";
		}
		Matcher matcher = pattern.matcher(query);
		while(matcher.find()) {
			String key = query.substring(matcher.start() + 1, matcher.end() - 1).trim();
			String replace = query.substring(matcher.start(), matcher.end());
			query = query.replace(replace, config.getProperty(key, ""));
			matcher = pattern.matcher(query);
		}
		return query;
	}
	
	public static String processQuery(String query, Class<?>...classes) {
		if(query == null) {
			return "";
		}
		for(Class<?> c : classes) {
			if(c == null) {
				return "";
			}
		}
		
		Pattern pattern = Pattern.compile("\\{[^{}]*\\}");
		Pattern p = Pattern.compile("\\.");
		Matcher matcher = pattern.matcher(query);
		while(matcher.find()) {
			int start = matcher.start();
			int end = matcher.end();
			StringBuilder sb = new StringBuilder(query);
			String key = query.substring(start + 1, end - 1).trim();
			
			//Process ClassName and Field
			String[] ss = p.split(key);
			String table = "";
			String field = "";
			if(ss.length >= 2) {
				for(Class<?> c : classes) {
					if(c.getName().toLowerCase().endsWith(ss[0].toLowerCase())) {
						Table tbl = (Table)c.getAnnotation(Table.class);
						if(tbl != null && tbl.name() != null && !"".equals(tbl.name())) {
							table = tbl.name();
							try {
								Field f = c.getDeclaredField(ss[1]);
								//CHECK ID
								Id id = f.getAnnotation(Id.class);
								if(id != null && id.name() != null && !"".equals(id.name())) {
									field = id.name();
								} else {
									Column col = f.getAnnotation(Column.class);
									if(col != null && col.name() != null && !"".equals(col.name())) {
										field = col.name();
									}
								}
							} catch (SecurityException e) {
								e.printStackTrace();
							} catch (NoSuchFieldException e) {
								e.printStackTrace();
							}
						}
						continue;
					}
				}
			} else if(ss.length >= 1){
				//TableName
				for(Class<?> c : classes) {
					if(c.getName().toLowerCase().endsWith(ss[0].toLowerCase())) {
						Table tbl = (Table)c.getAnnotation(Table.class);
						if(tbl != null && tbl.name() != null && !"".equals(tbl.name())) {
							table = tbl.name();
							break;
						}
					}
					
					Field[] fields = c.getDeclaredFields();
					for(Field f : fields) {
						if(f.getName().toLowerCase().equalsIgnoreCase(ss[0].toLowerCase())) {
							//CHECK ID
							Id id = f.getAnnotation(Id.class);
							if(id != null && id.name() != null && !"".equals(id.name())) {
								field = id.name();
								break;
							} else {
								//CHECK COLUMN
								Column col = f.getAnnotation(Column.class);
								if(col != null && col.name() != null && !"".equals(col.name())) {
									field = col.name();
									break;
								}
							}
						}
					}
					if(!"".equals(table) || !"".equals(field)) {
						break;
					}
				}
			} else {
				table = "";
				field = "";
			}
			
			String newString = "";
			if(!table.equals("") && !field.equals("")) {
				newString = table.trim() + "." + field.trim();
			} else {
				if(ss.length >= 2) {
					newString = "";
				} else {
					newString = table.trim() + field.trim();
				}
			}
			
			//Replace
			query = sb.replace(start, end, newString).toString();
			matcher = pattern.matcher(query);
		}
		
		return query;
	}

	public static PreparedStatement fillStatement(PreparedStatement stm, Object...objects) {
		if(objects == null) {
			return stm;
		}
		int num = 0;
		try {
			for(Object obj : objects) {
				num++;
				if(obj == null) {
					stm.setNull(num, Types.NULL);
				} else if(String.class.equals(obj.getClass())) {
					stm.setString(num, (String)obj);
				} else if(Byte.class.equals(obj.getClass())) {
					stm.setByte(num, (Byte)obj);
				} else if(Integer.class.equals(obj.getClass())) {
					stm.setInt(num, (Integer)obj);
				} else if(Short.class.equals(obj.getClass())) {
					stm.setShort(num, (Short)obj);
				} else if(Long.class.equals(obj.getClass())) {
					stm.setLong(num, (Long)obj);
				} else if(Float.class.equals(obj.getClass())) {
					stm.setFloat(num, (Float)obj);
				} else if(Double.class.equals(obj.getClass())) {
					stm.setDouble(num, (Double)obj);
				} else if(Boolean.class.equals(obj.getClass())){
					stm.setBoolean(num, (Boolean)obj);
				} else if (Date.class.equals(obj.getClass())) {
					stm.setDate(num, new java.sql.Date(((Date)obj).getTime()));
				} else if(java.util.Date.class.equals(obj.getClass())) {
					stm.setDate(num, new Date(((java.util.Date)obj).getTime()));
				} else {
					stm.setObject(num, obj);
				}
			}
		} catch(SQLException ex) {
			return null;
		}
		return stm;
	}
}
