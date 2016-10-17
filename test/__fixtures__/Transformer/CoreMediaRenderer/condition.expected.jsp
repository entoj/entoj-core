<c:if test="${ classes }"></c:if>
<c:if test="${ classes.markup() }"></c:if>
<c:if test="${ not model.headline or mode.copy }"></c:if>
<c:if test="${ '' != model.headline or ('' != model.subline and model.type == 'teaser') }"></c:if>
