function BookCard({ book, onClick }) {
  return (
    <div className="book-card cursor-pointer" onClick={onClick}>
      <div className="book-card-image">
        <img
          src={book.image_url}
          alt={book.column_title}
          className="w-full h-full object-contain transition-transform hover:scale-[1.03] duration-300"
        />
      </div>
      <div className="book-card-content">
        <h3 className="text-lg font-serif mb-1 line-clamp-1">{book.column_title}</h3>
        <p className="text-gray-900 text-sm mb-2">by {book.author}</p>
        <p className="text-gray-900 text-sm mb-2">{book.publish_date_display}</p>
        <p className="text-gray-900 text-sm overflow-hidden line-clamp-3 mb-4">
          {book.description}
        </p>
        <button className="btn-primary w-full text-sm font-bold">
          Learn more
        </button>
      </div>
    </div>
  );
}

export default BookCard;
