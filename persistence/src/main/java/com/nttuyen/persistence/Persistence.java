/**
 * 
 */
package com.nttuyen.persistence;


import java.util.Iterator;

/**
 * Persistence
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
public interface Persistence {
	/**
	 * Insert an object into Database
	 * @param <T>
	 * @param object - a object need store
	 * @throws PersistenceException - if error
	 */
	public <T> void insert(T object) throws PersistenceException;
	
	/**
	 * Update an object into Database
	 * @param <T>
	 * @param object - object need to update
	 * @throws PersistenceException
	 */
	public <T> void update(T object) throws PersistenceException;
	
	/**
	 * Insert or Update an object into Database
	 * @param <T>
	 * @param object - object need to save
	 * @throws PersistenceException
	 */
	public <T> void save(T object) throws PersistenceException;
	
	/**
	 * Remove an Object from Database
	 * @param <T>
	 * @param object - object need to remove
	 * @throws PersistenceException
	 */
	public <T> void remove(T object) throws PersistenceException;
	
	/**
	 * Retrial object by ID
	 * @param <T>
	 * @param c - type of object
	 * @param id - id of object
	 * @return - object if exists
	 */
	public <T> T getObjectByID(Class<T> c, long id);
	
	/**
	 * Get all object in Database
	 * @param <T>
	 * @param c - type of object
	 * @return - Iterator of all object in Database
	 */
	public <T> Iterator<T> listAll(Class<T> c);

    /**
     * List objects in Database by query
     * @param <T>
     * @param c
     * @param start - query to retrial object
     * @param limit
     * @return - Iterator of objects
     */
    public <T> Iterator<T> list(Class<T> c, long start, int limit);

	/**
	 * List objects in Database by query
	 * @param <T>
	 * @param c
	 * @param query - query to retrial object
	 * @return - Iterator of objects
	 */
	public <T> Iterator<T> list(Class<T> c, String query);
}
